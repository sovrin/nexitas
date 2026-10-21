# Changelog

## [0.2.0](https://github.com/sovrin/nexitas/compare/v0.1.0...v0.2.0) (2026-10-21)


### ⚠ BREAKING CHANGES

* **modules:** NexitasModule.status is gone; module sections and their API are a project's, under /p/<id> and /api/p/<id>; the project page moved from /projects/<id> to /p/<id>.
* **modules:** projects, module switches and the modules in the build

### Features

* a page kit that draws every module's pages ([e0f98e5](https://github.com/sovrin/nexitas/commit/e0f98e51f791b2f5ba6f9c41494d2a9245b43f18))
* a toolkit for the modules: CORS, bearer tokens, forms and formats ([d06e82c](https://github.com/sovrin/nexitas/commit/d06e82c39039030ba786b70d694136ac494cf8ac))
* core layer with module interfaces ([c407382](https://github.com/sovrin/nexitas/commit/c4073828a0fc38cf60621db0704a2ff7abde8f5d))
* **modules:** a project holds everything, under /p/&lt;id&gt; ([91cd76a](https://github.com/sovrin/nexitas/commit/91cd76a8fce515e05028ea8ac13731b24703e379))
* **modules:** erratas ([850d8dc](https://github.com/sovrin/nexitas/commit/850d8dc233b29ad8b8e7880c5c7670cc821c12f3))
* **modules:** linguitas ([151266f](https://github.com/sovrin/nexitas/commit/151266fd2cf17db63ada539f46a586b40a1f526b))
* **modules:** projects, module switches and the modules in the build ([98101c1](https://github.com/sovrin/nexitas/commit/98101c1898959eb2b220404f5e3740ae8528a0f1))
* **modules:** veritas, and a body limit a module can raise ([7460f5c](https://github.com/sovrin/nexitas/commit/7460f5ce1a34f075b3859a5468bf88facf449cb1))


### Bug Fixes

* **database:** run the core's steps after the modules' ([fbe1adf](https://github.com/sovrin/nexitas/commit/fbe1adf6f8a2aac0ce3e233998013f4738f2ed53))
* fetch the modules with node, before the first install ([0aa3ad5](https://github.com/sovrin/nexitas/commit/0aa3ad5f7e7814a4dcc426eb73ae4bcd4e77ce32))
* fetch the modules with node, before the first install ([f9f0405](https://github.com/sovrin/nexitas/commit/f9f04056f3052cd8d7bdd9a5885bb44a080d7cf3))
* give modules in .modules the nexitas types their tsconfig expects ([fc47374](https://github.com/sovrin/nexitas/commit/fc47374c577a021668bbf358abbc286bb160601c))
* **modules:** build erratas from master, as every other module ([e679aa2](https://github.com/sovrin/nexitas/commit/e679aa255d9558e08097b40f556ca63e53d60f6f))
