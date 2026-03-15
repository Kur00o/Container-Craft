import yaml
from typing import List, Tuple, Dict, Any
 
from app.models import ServiceConfig, RestartPolicy, HealthCheck, BuildConfig

SUPPORTED_SERVICE_KEYS = {
    "image", "ports", "environment", "volumes", "networks",
    "depends_on", "restart", "command", "healthcheck", "build",
    "network_mode", "cpu_limit", "memory_limit",
}

SUPPORTED_TOP_LEVEL_KEYS = {"version", "services", "networks", "volumes"}

COMPLEX_NETWORK_KEYS = {"ipam", "driver_opts", "labels", "attachable", "internal"}

class YAMLParseError(Exception):
    """Raised when the YAML string cannot be parsed or is structurally invalid."""
    pass

def parse_compose_yaml(yaml_string: str) -> Tuple[List[ServiceConfig], List[str]]:
    """
    Parse a docker-compose YAML string into a list of ServiceConfig objects.
 
    argument:: yaml_string: Raw docker-compose.yml content as a string
    returns::  Tuple of:
               - List[ServiceConfig]: parsed services
               - List[str]: warnings about unsupported/ignored features
 
    raises::   YAMLParseError if the YAML is syntactically invalid or missing
               the required 'services' block
    """
    warnings: List[str] = []

    try:
        compose_dict = yaml.safe_load(yaml_string)
    except yaml.YAMLError as e:
        raise YAMLParseError(f"Invalid YAML syntax: {e}")
 
    if not isinstance(compose_dict, dict):
        raise YAMLParseError("YAML content is not a valid docker-compose structure.")
 
    for key in compose_dict:
        if key not in SUPPORTED_TOP_LEVEL_KEYS:
            warnings.append(
                f"Top-level key '{key}' is not supported by ContainerCraft and was ignored."
            )
    
    services_dict: Dict[str, Any] = compose_dict.get("services")
    if not services_dict or not isinstance(services_dict, dict):
        raise YAMLParseError("No valid 'services' block found in the YAML.")
 
    networks_dict: Dict[str, Any] = compose_dict.get("networks", {}) or {}
    for net_name, net_config in networks_dict.items():
        if not isinstance(net_config, dict):
            continue
        found_complex = COMPLEX_NETWORK_KEYS & set(net_config.keys())
        if found_complex:
            warnings.append(
                f"Network '{net_name}' uses advanced config {found_complex} "
                f"which ContainerCraft cannot represent — simplified to a basic bridge network."
            )
        if net_config.get("external"):
            warnings.append(
                f"Network '{net_name}' is marked as external. "
                f"ContainerCraft will treat it as a regular named network."
            )
    
    services: List[ServiceConfig] = []
 
    for service_name, service_data in services_dict.items():
        if not isinstance(service_data, dict):
            warnings.append(f"Service '{service_name}' has no configuration — skipped.")
            continue
 
        # Warn about unsupported service-level keys
        unsupported = set(service_data.keys()) - SUPPORTED_SERVICE_KEYS
        if unsupported:
            warnings.append(
                f"Service '{service_name}': unsupported keys {unsupported} were ignored. "
                f"(ContainerCraft does not yet support these features.)"
            )
 
        service_config = _dict_to_service_config(service_name, service_data, warnings)
        if service_config:
            services.append(service_config)
 
    return services, warnings
    
def _dict_to_service_config(
    name: str,
    data: Dict[str, Any],
    warnings: List[str]
) -> ServiceConfig | None:
    """
    Convert a single service dictionary into a ServiceConfig object.
 
    argument:: name: Service name (the key in the services block)
    argument:: data: Raw service configuration dict
    argument:: warnings: List to append any conversion warnings into
    returns::  ServiceConfig or None if conversion fails
    """
    try:
        image = data.get("image", "")
 
        raw_ports = data.get("ports", [])
        ports = [str(p) for p in raw_ports]
 
        raw_env = data.get("environment", {})
        environment: Dict[str, str] = {}
        if isinstance(raw_env, dict):
            environment = {str(k): str(v) for k, v in raw_env.items()}
        elif isinstance(raw_env, list):
            for item in raw_env:
                if "=" in str(item):
                    k, v = str(item).split("=", 1)
                    environment[k] = v
                else:
                    environment[str(item)] = ""
                    warnings.append(
                        f"Service '{name}': env var '{item}' has no value — set to empty string."
                    )
 
        volumes = [str(v) for v in data.get("volumes", [])]
 
        raw_networks = data.get("networks", [])
        if isinstance(raw_networks, dict):
            networks = list(raw_networks.keys())
            if any(v for v in raw_networks.values()):
                warnings.append(
                    f"Service '{name}': per-network options (aliases, etc.) are not supported "
                    f"and were ignored."
                )
        else:
            networks = [str(n) for n in raw_networks]
 
        raw_deps = data.get("depends_on", [])
        if isinstance(raw_deps, dict):
            depends_on = list(raw_deps.keys())
            warnings.append(
                f"Service '{name}': depends_on condition syntax (service_healthy etc.) "
                f"is not supported — converted to a plain dependency list."
            )
        else:
            depends_on = [str(d) for d in raw_deps]
 
        raw_restart = data.get("restart", "unless-stopped")
        try:
            restart = RestartPolicy(raw_restart)
        except ValueError:
            warnings.append(
                f"Service '{name}': unknown restart policy '{raw_restart}' — "
                f"defaulting to 'unless-stopped'."
            )
            restart = RestartPolicy.unless_stopped
 
        raw_command = data.get("command")
        command: str | None = None
        if raw_command is not None:
            # Can be a string or a list
            if isinstance(raw_command, list):
                command = " ".join(str(c) for c in raw_command)
            else:
                command = str(raw_command)

        healthcheck: HealthCheck | None = None
        raw_hc = data.get("healthcheck")
        if raw_hc and isinstance(raw_hc, dict):
            # 'disable: true' is a valid compose option — skip it
            if raw_hc.get("disable"):
                warnings.append(
                    f"Service '{name}': healthcheck is disabled in source YAML — skipped."
                )
            else:
                healthcheck = HealthCheck(
                    test=raw_hc.get("test", []),
                    interval=raw_hc.get("interval", "30s"),
                    timeout=raw_hc.get("timeout", "10s"),
                    retries=int(raw_hc.get("retries", 3)),
                    start_period=raw_hc.get("start_period", "0s"),
                )
 
        # ── build ─────────────────────────────────────────────────────────────
        build: BuildConfig | None = None
        raw_build = data.get("build")
        if raw_build:
            if isinstance(raw_build, str):
                # Short syntax: build: ./dir
                build = BuildConfig(context=raw_build, dockerfile="Dockerfile")
            elif isinstance(raw_build, dict):
                build = BuildConfig(
                    context=raw_build.get("context", "."),
                    dockerfile=raw_build.get("dockerfile", "Dockerfile"),
                )
 
        # ── network_mode ──────────────────────────────────────────────────────
        network_mode: str | None = data.get("network_mode")
 
        # ── resource limits ───────────────────────────────────────────────────
        # Compose v3 uses deploy.resources.limits
        cpu_limit: float | None = None
        memory_limit: str | None = None
        deploy = data.get("deploy", {})
        if isinstance(deploy, dict):
            limits = deploy.get("resources", {}).get("limits", {})
            if limits:
                raw_cpu = limits.get("cpus")
                raw_mem = limits.get("memory")
                if raw_cpu:
                    try:
                        cpu_limit = float(raw_cpu)
                    except ValueError:
                        warnings.append(
                            f"Service '{name}': could not parse cpu limit '{raw_cpu}' — ignored."
                        )
                if raw_mem:
                    memory_limit = str(raw_mem)
 
        return ServiceConfig(
            name=name,
            image=image,
            ports=ports,
            environment=environment,
            volumes=volumes,
            networks=networks,
            depends_on=depends_on,
            restart=restart,
            command=command,
            healthcheck=healthcheck,
            build=build,
            network_mode=network_mode,
            cpu_limit=cpu_limit,
            memory_limit=memory_limit,
        )
 
    except Exception as e:
        warnings.append(
            f"Service '{name}' could not be fully parsed and was skipped: {e}"
        )
        return None