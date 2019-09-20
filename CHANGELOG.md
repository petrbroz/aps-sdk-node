# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.0.1] - 2019-09-20

### Fixed
- SVF utility for parsing meshes now returns the expected number of objects

## [6.0.0] - 2019-09-20

### Added
- Support for downloading SVFs to local folder

### Fixed
- Removed unnecessary `async` from SVF utils (note that this is a breaking change)

## [5.3.0] - 2019-09-19

### Added
- More updates and code documentation for SVF parsing utilities

## [5.2.0] - 2019-09-18

### Added
- Support for streamed upload and download
- New helper class for searching through Model Derivative manifests
- Improved typings for Model Derivative manifests and derivatives, so better intellisense!
- Initial support for parsing SVF files (see src/svf/README.md for details)

## [5.1.0] - 2019-09-12

### Added
- Support for copying objects within OSS bucket

## [5.0.0] - 2019-09-03

### Changed
- Methods and interfaces for creating/updating Design Automation objects
  - Activities can now define multiple command lines and multiple app bundles
  - Interfaces now better reflect the expected structure of DA inputs/outputs

## [4.4.0] - 2019-08-30

### Added
- Helper method for uploading app bundle archives (`DesignAutomationClient.uploadAppBundleArchive`)

### Fixed
- Creating/updating app bundles now returns the right type (with upload params)

## [4.1.2] - 2019-07-31

### Added
- Simple example of using the browser bundle
- Utility function for converting IDs to URNs
- Generating code docs using [typedoc](https://github.com/TypeStrong/typedoc)

## [4.1.0] - 2019-07-31

### Added
- Bundling into a library for browsers

### Changed
- Renamed project from _forge-nodejs-utils_ to _forge-server-utils_

## [4.0.0] - 2019-07-29

### Changed
- Replaced all HTTP communication with [axios](https://github.com/axios/axios).
