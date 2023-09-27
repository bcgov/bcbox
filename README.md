
# BCBox

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

![Tests](https://github.com/bcgov/bcbox/workflows/Tests/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/bfaf1cdb7fe730c10840/maintainability)](https://codeclimate.com/github/bcgov/bcbox/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/bfaf1cdb7fe730c10840/test_coverage)](https://codeclimate.com/github/bcgov/bcbox/test_coverage)

A frontend UI for managing access control to S3 Objects

To learn more about the **Common Services** available visit the [Common Services Showcase](https://bcgov.github.io/common-service-showcase/) page.

## Directory Structure

```txt
.github/                   - PR, Issue templates and CI/CD
.vscode/                   - VSCode environment configurations
app/                       - Application Root
├── src/                   - Node.js web application
│   └── components/        - Components Layer
└── tests/                 - Node.js web application tests
chart/                     - General Helm Charts
└── bcbox/                 - BCBox Helm Chart Repository
    └── templates/         - BCBox Helm Chart Template manifests
frontend/                  - Frontend Root
├── src/                   - Node.js web application
│   ├── assets/            - Static File Assets
│   ├── components/        - Components Layer
│   ├── composables/       - Common composition elements
│   ├── interfaces/        - Typescript interface definitions
│   ├── lib/               - Repackaged external libraries
│   ├── router/            - Router Layer
│   ├── services/          - Services Layer
│   ├── store/             - Store Layer
│   ├── types/             - Typescript type definitions
│   ├── utils/             - Utility components
│   └── views/             - View Layer
└── tests/                 - Node.js web application tests
bcgovpubcode.yaml          - BCGov Public Code manifest
CODE-OF-CONDUCT.md         - Code of Conduct
COMPLIANCE.yaml            - BCGov PIA/STRA compliance status
CONTRIBUTING.md            - Contributing Guidelines
Dockerfile                 - Dockerfile Image definition
LICENSE                    - License
SECURITY.md                - Security Policy and Reporting
```

## Documentation

* [Application Readme](frontend/README.md)
* [Product Roadmap](https://github.com/bcgov/bcbox/wiki/Product-Roadmap)
* [Product Wiki](https://github.com/bcgov/bcbox/wiki)
* [Security Reporting](SECURITY.md)

## Getting Help or Reporting an Issue

To report bugs/issues/features requests, please file an [issue](https://github.com/bcgov/bcbox/issues).

## How to Contribute

If you would like to contribute, please see our [contributing](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

## Forking & Self-hosting

If you intend to fork, host and support your own version of this application, please ensure that you re-brand the application's name and content. Please remove any notices, links or contact information and consider contributing new features back to this repository.

## License

```txt
Copyright 2022 Province of British Columbia

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
