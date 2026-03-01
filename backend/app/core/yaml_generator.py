from typing import List, Dict, Any
import yaml
from app.models import ServiceConfig, ComposeConfig

class YAMLGenerator:
    def __init__(self):
        self.compose_version = "3.8"
    
    def generate_yaml(self, compose_config: ComposeConfig) -> str:
        """
        Generate docker-compose YAML from ComposeConfig
        arguement:: compose_config: ComposeConfig object with services
        output format:: str: Formatted YAML string
        """
        compose_dict = {
            "version": compose_config.version,
            "services": {}
        }

        for service in compose_config.services:
            compose_dict["services"][service.name] = self._service_to_dict(service)
        
        networks = self._extract_networks(compose_config.services)
        if networks:
            compose_dict["networks"] = networks
        
        #converting to yaml format with apt. formatting

        yaml_output = yaml.dump(
            compose_dict,
            default_flow_style=False,
            sort_keys=False,
            indent=2,
            allow_unicode=True
        )
        
        return yaml_output

    def _service_to_dict(self, service: ServiceConfig) -> Dict[str, Any]:
        """
        Convert ServiceConfig to dictionary for YAML
        arguement:: service: ServiceConfig object
        output format:: dict: Service configuration as dictionary
        """
        service_dict = {
            "image": service.image
        }
        
        # add ports if specified
        if service.ports:
            service_dict["ports"] = service.ports
        
        # add environment variables if specified
        if service.environment:
            service_dict["environment"] = service.environment
        
        # add volumes if specified
        if service.volumes:
            service_dict["volumes"] = service.volumes
        
        # add networks if specified
        if service.networks:
            service_dict["networks"] = service.networks
        
        # add depends_on if specified
        if service.depends_on:
            service_dict["depends_on"] = service.depends_on
        
        # add restart policy (convert enum to string)
        if service.restart:
            service_dict["restart"] = service.restart.value
        
        # add command if specified
        if service.command:
            service_dict["command"] = service.command
        
        return service_dict
    
    def _extract_networks(self, services: List[ServiceConfig]) -> Dict[str, Any]:
        """
        Extract unique networks from services and create network definitions
        arguements:: services: List of ServiceConfig objects   
        returns:: dict: Network definitions
        """
        # getting in all the unique network names.
        network_names = set()
        for service in services:
            network_names.update(service.networks)
        
        if not network_names:
            return {}
        
        # Create network definitions (using default driver)
        networks = {}
        for network_name in network_names:
            networks[network_name] = {
                "driver": "bridge"
            }
        
        return networks
    


# testing yamlgenerator with basic information.
def test_yaml_generator():
    """Test the YAML generator with sample data"""
    from app.models import ServiceConfig, ComposeConfig, RestartPolicy
    
    # Create sample services
    nginx = ServiceConfig(
        name="nginx",
        image="nginx:latest",
        ports=["80:80", "443:443"],
        volumes=["./nginx.conf:/etc/nginx/nginx.conf:ro"],
        networks=["frontend"],
        restart=RestartPolicy.unless_stopped
    )
    
    postgres = ServiceConfig(
        name="postgres",
        image="postgres:14",
        environment={
            "POSTGRES_PASSWORD": "secret",
            "POSTGRES_DB": "mydb",
            "POSTGRES_USER": "admin"
        },
        volumes=["postgres_data:/var/lib/postgresql/data"],
        networks=["backend"],
        restart=RestartPolicy.always
    )
    
    app = ServiceConfig(
        name="app",
        image="node:18",
        command="npm start",
        ports=["3000:3000"],
        environment={"NODE_ENV": "development"},
        networks=["frontend", "backend"],
        depends_on=["postgres"],
        restart=RestartPolicy.unless_stopped
    )
    
    # Create compose config
    compose = ComposeConfig(
        version="3.8",
        services=[nginx, postgres, app]
    )
    
    # Generate YAML
    generator = YAMLGenerator()
    yaml_output = generator.generate_yaml(compose)
    
    print("Generated docker-compose.yml:")
    print("=" * 50)
    print(yaml_output)
    print("=" * 50)
    
    return yaml_output


if __name__ == "__main__":
    # Run test when script is executed directly
    test_yaml_generator()