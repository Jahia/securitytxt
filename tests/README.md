# Tests

This repository contains a framework to perform both API and UI integration tests, and includes a CircleCI configuration that handles the submission of the tests results to Testrail and slack notification to alert the team of failure on the main branch or during nightly runs.

The codebase of the integration tests is fully separated from the module codebase and sits in the `tests` folder.

## Overview 

### High-level test execution

Before diving into the tests themselves it is critical to properly understand the overall high-level execution flow.

* Step 1: Spin-up Jahia
* Step 2: Provision Jahia and configure the environment based on a provisioning script
* Step 3: Execute the tests
* Step 4: Wrap-up the execution (generate reports, export run artifacts...)

All these 4 steps are supported by configuration elements contained in the `tests/` folder and can be executed in a fully automated fashion.

### Filesystem

The following files and folder play a key role in the execution of the tests.

| File/folder | Description |
| --- | --- |
| `.env.example` | Contains default values for the environment variables used by both Docker and Cypress, these values can be loaded using the command `source set-env.sh` |
| `ci.build.sh` | Small facility script that can be used to build the test container, in most cases it will be rarely used |
| `ci.postrun.sh` | A bash script automatically executed by the CI platform once all tests have been exectued. This file can be used to [export additional logs](https://github.com/Jahia/jexperience/blob/master/tests/ci.postrun.sh) or manipulate files before the artifacts are persisted by the CI platform. |
| `ci.startup.sh` | A bash script executed by the CI platform to spin-up the entire environment (full Docker). You can also use it locally, and in most development use cases you will pass the `notests` argument to spin-up the environment without running the tests.
| `cypress` | The folder container cypress itself and its tests.
| `env.run.sh` | A bash script executed to provision the environment and start the tests. When running the environment in full Docker mode, this is the (only) script executed by the Cypress container. This script can also be used locally (likely only once, before using `yarn run e2e:debug`) when developing the tests).
| `set-env.sh` | A script to load the necessary environment variables into the current shell. You would call it using `source set-env.sh`.

### Environment Variables

Environment variables are also a critical topic for test execution as they are used to define URLs, credentials, manifests.

All environment variables are (and should be) listed in the `.env.example` file, default values can be loaded using `source set-env.sh`.

Example of content:
```bash
JAHIA_URL=${JAHIA_URL:-http://localhost:8080}
JAHIA_IMAGE=${JAHIA_IMAGE:-ghcr.io/jahia/jahia-ee-dev:8-SNAPSHOT}
```

It is best to familiarize yourself with the content of the `.env.example` file when discovery a new repository.

#### Watch-out for default values

If a value was already present in your shell, it will **NOT** be overridden when running `source set-env.sh`. 

For example, if you do the following:
```bash
export JAHIA_URL=http://my-great-url:8080
source set-env.sh
```

The value of `JAHIA_URL` is going to be `http://my-great-url:8080` not `http://localhost:8080`, the latter being the default in case no `JAHIA_URL` was previously defined.

#### No default values for credentials

In some repositories, there will be a need to reach our corporate NEXUS or provide a license file. For obvious security reasons these credentials are not going to be provided default values.

```bash
NEXUS_USERNAME=${NEXUS_USERNAME:-NEXUS_USERNAME}
NEXUS_PASSWORD=${NEXUS_PASSWORD:-NEXUS_PASSWORD}
```

For example, if you didn't previously provided a value to the `NEXUS_PASSWORD` environment variable, its default value will be `NEXUS_PASSWORD` which will fail authentication if necessary during provisioning.

#### Jahia warmup and provisioning

It is not the job of a testing suite to configure the system (for example, install modules, execute groovy scripts) in order to be able to execute the tests. This should be handled ahead of starting test execution.

Since Jahia 8.0.3.0, a provisioning API was introduced to allow remote provisioning of a Jahia instance.

Note that this replaces `jahia-cli` that was used for some projects in 2020. The major difference (important to keep in mind) is that `jahia-cli` was handling Jahia provisioning from the testing container while the provisioning API send a manifest to Jahia, which then takes care of self-provisioning. The main limitation here is that Jahia cannot access artifacts that are not published in a location it can reach (see below).

In most cases you will find two manifests in the `tests/` folder:
| Name | Purpose |
| --- | --- |
| `provisioning-manifest-build.yml` | Provisioning manifest to be used when we want to use a module that was just built and was previously submitted to Jahia (for example via the `env.run.sh` script)
| `provisioning-manifest-snapshot.yml` | Provisioning manifest to be used when we want to install everything (including the module) from remote resources (for example from Nexus) 

**Important note**: NEXUS_USERNAME and NEXUS_PASSWORD are automatically replaced by the corresponding environment variables (defined at runtime or in the `.env.example` file) when the Docker image is running, DO NOT put nexus credentials in the yml file. This would work but is not safe since this file is aimed at being checked in the remote (and potentially public) codebase.

#### Docker login

For the tests you will likely need to pull private Docker images and doing so requires authentication.

```bash
docker login
```

Docker login usually only needs to be done once.

## Run the tests

Two options are available to run the tests, you can either run everything in Docker or only run Jahia in Docker and run the tests using your local node.

### Run all in Docker

Once you have a built test container, the entirety of the tests, from environment provisioning to report generation, can be executed using a single command.

```bash
# Build the test container
> bash ci.build.sh
# Execute the tests
> bash ci.startup.sh
```

This is this exact process that will be used by the CI platform to execute the tests. And although it's definitely the easiest way of going through one run, it's also the method you're the less likely to use on a day-to-day (that would have been too easy, isn't it ?). 

The primary reason for this method to be "somewhat" reserved to the CI platform, is that it doesn't make it easy to develop new tests or debug one single test.

IMPORTANT: If you are using this method locally, do not forget that you will need to **rebuilt the test container** (`bash ci.build.sh`) for everytime a change is done in the `tests/` folder, otherwise your change will not make their way to the container.

### Run the tests on a local node

This is the method you will be using the most when developing or debug tests, and the major point of attention here concerns the use of the `env.run.sh` script.

As a reminder, the purpose of the `env.run.sh` script is to provision the environment **AND** execute the tests, in most cases you'd want to provision the environment only once, but run the tests multiple times.

```bash
# Fetch the necessary javascript dependencies
> yarn
# Run the docker environment, but without the tests
> bash ci.startup.sh notests
# Provision the environment and run the tests in headless once
> bash env.run.sh
> source set-env.sh
> yarn run e2e:debug
```

The advantage of this approach is that you'll get to run the tests in headless once, and although it delays a bit the time by which you can start developing, it also give you a good sense of whether your environment is setup properly.

Do *NOT* forget to load your environment variables using `source set-env.sh` prior to running Cypress, as well as **everytime you open a new terminal**.

In most situations you will end-up with a lot of unit tests, slightly less API e2e, and fewer UI e2e. Note that the purpose of these tests is to validate the proper behavior/operation of the module being developed. It would likely still be necessary to implement various high level integration tests to ensure your module operate well with other in different "real-life" deployment scenarios (but those tests are typically executed after merging of the code).