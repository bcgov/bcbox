# bcbox

![Version: 0.0.17](https://img.shields.io/badge/Version-0.0.17-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.8.0](https://img.shields.io/badge/AppVersion-0.8.0-informational?style=flat-square)

A frontend UI for managing access control to S3 Objects

**Homepage:** <https://bcgov.github.io/bcbox>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| NR Common Service Showcase Team | <NR.CommonServiceShowcase@gov.bc.ca> | <https://bcgov.github.io/common-service-showcase/team.html> |

## Source Code

* <https://github.com/bcgov/bcbox>

## Requirements

Kubernetes: `>= 1.13.0`

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| autoscaling.behavior | object | `{"scaleDown":{"policies":[{"periodSeconds":120,"type":"Pods","value":1}],"selectPolicy":"Max","stabilizationWindowSeconds":120},"scaleUp":{"policies":[{"periodSeconds":30,"type":"Pods","value":2}],"selectPolicy":"Max","stabilizationWindowSeconds":0}}` | Behavior configures the scaling behavior of the target in both Up and Down directions (scaleUp and scaleDown fields respectively). |
| autoscaling.enabled | bool | `false` | Specifies whether the Horizontal Pod Autoscaler should be created |
| autoscaling.maxReplicas | int | `16` |  |
| autoscaling.minReplicas | int | `2` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| config.configMap | object | `{"FRONTEND_APIPATH":"api/v1","FRONTEND_COMS_APIPATH":null,"FRONTEND_OIDC_AUTHORITY":null,"FRONTEND_OIDC_CLIENTID":null,"SERVER_APIPATH":"/api/v1","SERVER_BODYLIMIT":"30mb","SERVER_CHES_APIPATH":null,"SERVER_CHES_FROM":null,"SERVER_CHES_TOKENURL":null,"SERVER_LOGLEVEL":"http","SERVER_OIDC_AUTHORITY":null,"SERVER_OIDC_IDENTITYKEY":null,"SERVER_OIDC_PUBLICKEY":null,"SERVER_PORT":"8080"}` | These values will be wholesale added to the configmap as is; refer to the bcbox documentation for what each of these values mean and whether you need them defined. Ensure that all values are represented explicitly as strings, as non-string values will not translate over as expected into container environment variables. For configuration keys named `*_ENABLED`, either leave them commented/undefined, or set them to string value "true". |
| config.enabled | bool | `false` | Set to true if you want to let Helm manage and overwrite your configmaps. |
| config.releaseScoped | bool | `false` | This should be set to true if and only if you require configmaps and secrets to be release scoped. In the event you want all instances in the same namespace to share a similar configuration, this should be set to false |
| failurePolicy | string | `"Retry"` | DeploymentConfig pre-hook failure behavior |
| fullnameOverride | string | `nil` | String to fully override fullname |
| image.pullPolicy | string | `"IfNotPresent"` | Default image pull policy |
| image.repository | string | `"ghcr.io/bcgov"` | Default image repository |
| image.tag | string | `nil` | Overrides the image tag whose default is the chart appVersion. |
| imagePullSecrets | list | `[]` | Specify docker-registry secret names as an array |
| nameOverride | string | `nil` | String to partially override fullname |
| networkPolicy.enabled | bool | `true` | Specifies whether a network policy should be created |
| podAnnotations | object | `{}` | Annotations for app pods |
| podSecurityContext | object | `{}` | Privilege and access control settings |
| replicaCount | int | `2` | Number of pod replicas running in the deployment |
| resources.limits.cpu | string | `"200m"` | Limit Peak CPU (in millicores ex. 1000m) |
| resources.limits.memory | string | `"256Mi"` | Limit Peak Memory (in gigabytes Gi or megabytes Mi ex. 2Gi) |
| resources.requests.cpu | string | `"10m"` | Requested CPU (in millicores ex. 500m) |
| resources.requests.memory | string | `"128Mi"` | Requested Memory (in gigabytes Gi or megabytes Mi ex. 500Mi) |
| route.annotations | object | `{}` | Annotations to add to the route |
| route.enabled | bool | `true` | Specifies whether a route should be created |
| route.host | string | `"chart-example.local"` |  |
| route.tls.insecureEdgeTerminationPolicy | string | `"Redirect"` |  |
| route.tls.termination | string | `"edge"` |  |
| route.wildcardPolicy | string | `"None"` |  |
| securityContext | object | `{}` | Privilege and access control settings |
| service.port | int | `8080` | Service port |
| service.portName | string | `"http"` | Service port name |
| service.type | string | `"ClusterIP"` | Service type |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.enabled | bool | `false` | Specifies whether a service account should be created |
| serviceAccount.name | string | `nil` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template |

----------------------------------------------
Autogenerated from chart metadata using [helm-docs v1.11.3](https://github.com/norwoodj/helm-docs/releases/v1.11.3)
