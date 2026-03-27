import axios from 'axios';
import yaml from 'js-yaml';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export const generateYAML = async (services) => {
  try {
    const response = await api.post('/yaml/generate', { services });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const validateCompose = async (yamlString) => {
  try {
    const response = await api.post('/yaml/validate', { yaml: yamlString });
    return response.data;
  } catch (error) {
    console.error(error);
    return { valid: false, errors: [error.message] };
  }
};

export const getTemplates = async () => {
  try {
    const response = await api.get('/templates');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deployStack = async (yamlString) => {
  try {
    const response = await api.post('/deploy', { yaml: yamlString });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

export const generateYAMLLocally = (nodes) => {
  const compose = {
    version: '3.8',
    services: {},
    networks: {
      default: {
        driver: 'bridge',
      },
    },
  };

  nodes.forEach(node => {
    const data = node.data;
    if (!data.name) return;

    const serviceDef = {
      image: data.image || 'alpine:latest',
    };

    if (data.ports && data.ports.length > 0) {
      serviceDef.ports = [...data.ports];
    }

    if (data.environment && Object.keys(data.environment).length > 0) {
      // Convert to array of strings "key=value" per docker compose standard, or keep as object
      // Object is valid in compose
      serviceDef.environment = { ...data.environment };
    }

    if (data.volumes && data.volumes.length > 0) {
      serviceDef.volumes = [...data.volumes];
    }

    if (data.networks && data.networks.length > 0) {
      serviceDef.networks = [...data.networks];
    } else {
      serviceDef.networks = ['default'];
    }

    if (data.depends_on && data.depends_on.length > 0) {
      serviceDef.depends_on = [...data.depends_on];
    }

    compose.services[data.name.toLowerCase().replace(/[^a-z0-9_-]/g, '')] = serviceDef;
  });

  return yaml.dump(compose);
};

export const SERVICES = [
  { id: 'nginx', name: 'nginx', image: 'nginx:latest', category: 'Frontend', color: '#10b981', ports: ['80:80', '443:443'], description: 'Web server & reverse proxy', version: 'nginx:latest' },
  { id: 'postgres', name: 'postgres', image: 'postgres:14', category: 'Database', color: '#3b82f6', ports: ['5432:5432'], description: 'Relational database', version: 'postgres:14' },
  { id: 'redis', name: 'redis', image: 'redis:alpine', category: 'Cache', color: '#f59e0b', ports: ['6379:6379'], description: 'In-memory data store', version: 'redis:alpine' },
  { id: 'mongodb', name: 'mongodb', image: 'mongo:latest', category: 'Database', color: '#10b981', ports: ['27017:27017'], description: 'NoSQL document database', version: 'mongo:latest' },
  { id: 'mysql', name: 'mysql', image: 'mysql:8', category: 'Database', color: '#3b82f6', ports: ['3306:3306'], description: 'Relational database', version: 'mysql:8' },
  { id: 'node', name: 'node', image: 'node:18', category: 'Backend', color: '#3b82f6', ports: ['3000:3000'], description: 'JavaScript runtime', version: 'node:18' },
  { id: 'python', name: 'python', image: 'python:3.11', category: 'Backend', color: '#f59e0b', ports: ['8000:8000'], description: 'Python runtime', version: 'python:3.11' },
  { id: 'apache', name: 'apache', image: 'httpd:latest', category: 'Frontend', color: '#8b5cf6', ports: ['80:80', '443:443'], description: 'HTTP server', version: 'httpd:latest' },
  { id: 'rabbitmq', name: 'rabbitmq', image: 'rabbitmq:3-management', category: 'Cache', color: '#f59e0b', ports: ['5672:5672', '15672:15672'], description: 'Message broker', version: 'rabbitmq:3-management' },
  { id: 'elasticsearch', name: 'elasticsearch', image: 'elasticsearch:8.11.0', category: 'Database', color: '#10b981', ports: ['9200:9200', '9300:9300'], description: 'Search engine', version: 'elasticsearch:8.11.0' },
];

export const TEMPLATES = [
  { id: 'lamp', name: 'LAMP Stack', description: 'Linux, Apache, MySQL, PHP', services: ['apache', 'mysql'], tags: ['apache', 'mysql'], color: '#8b5cf6', letter: 'L' },
  { id: 'mern', name: 'MERN Stack', description: 'MongoDB, Express, React, Node', services: ['mongodb', 'node'], tags: ['mongodb', 'node'], color: '#3b82f6', letter: 'M' },
  { id: 'django-pg', name: 'Django + PG', description: 'Django with PostgreSQL', services: ['python', 'postgres'], tags: ['python', 'postgres'], color: '#10b981', letter: 'D' },
  { id: 'flask-pg', name: 'Flask + PG', description: 'Flask with PostgreSQL', services: ['python', 'postgres', 'redis'], tags: ['python', 'postgres', 'redis'], color: '#f59e0b', letter: 'F' },
];
