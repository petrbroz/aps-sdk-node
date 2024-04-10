# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [10.0.1] - 2024-04-10

## [10.0.0] - 2024-04-10

### Changed
- Model derivative downloads now use the new direct-s3 logic.
- Migrated to Authentication API v2

## [9.0.0] - 2022-08-19

### Changed
- Uploading/downloading of OSS objects now uses the new binary transfer endpoints.
- Resumable upload methods (`uploadObjectResumable`, `uploadObjectStreamResumable`, `getResumableUploadStatus`)
are now marked as deprecated, and will be removed in the next major release. Use `getUploadUrls` and `completeUpload` instead.
- New `useCdn` flag when generating signed URLs (true by default).

## [8.4.0] - 2022-07-04

### Added
- Querying derivative trees and properties for specific object ID

## [8.3.5] - 2022-01-05

### Added
- Support for filtering BIM360 issues by `status` and `assigned_to`

## [8.3.4] - 2021-11-01

### Added
- Support for specifying `receiver` of DA app bundle and activity aliases

## [8.3.3] - 2021-09-27

### Added
- The `ForgeClient` base class is now included in the library index

### Fixed
- URL-encoding when paging through OSS entities

## [8.3.2] - 2021-03-09

### Fixed
- Object uploading now allows large files

## [8.3.1] - 2021-02-04

### Fixed
- Fixed Github Actions build and NPM publishing

## [8.3.0] - 2021-02-04

### Added
- Method for retrieving info about BIM 360 folders
- Including parent folder info in BIM 360 items

### Fixed
- Updated dependencies

### Changed
- Moved CI/CD to Github Actions

## [8.2.2] - 2021-01-06

### Fixed
- Updated dependencies

## [8.2.1] - 2020-11-20

### Added
- Downloading Model Derivative assets in chunks using the Range header

### Fixed
- Removed deprecated utility code
- Upgraded dependency versions

## [8.2.0] - 2020-10-29

### Added
- Support for specifying workflow ID/attributes (for Forge Webhooks) in Model Derivative jobs.
- Support for additional output types in Model Derivative jobs.

## [8.1.7] - 2020-09-11

### Added
- Latest version of Data Management items now included in the response (kudos to https://github.com/liskaj).

### Fixed
- 3rd party dependencies.

## [8.1.6] - 2020-08-12

### Fixed
- Hub/project names are now retrieved properly.

## [8.1.5] - 2020-07-21

### Fixed
- Couple of minor fixes in the BIM360 client by [mazerab](https://github.com/mazerab)

## [8.1.4] - 2020-07-14

### Added
- Support for uploading to BIM360 Docs (kudos to [mazerab](https://github.com/mazerab))

## [8.1.3] - 2020-07-02

### Added
- Various BIM360 methods now support an additional parameter specifying user ID for 2-legged contexts (kudos to https://github.com/mazerab).
- Getting BIM360 item details now returns additional information (kudos to https://github.com/liskaj).

## [8.1.2] - 2020-06-12

### Fixed
- Operations on OSS objects now always URI-encode object names.

## [8.1.1] - 2020-06-03

### Fixed
- Broken pagination of BIM360/DM APIs.

## [8.1.0] - 2020-05-18

### Added
- Initial support for Reality Capture APIs (kudos to [mazerab](https://github.com/mazerab))

## [8.0.14] - 2020-04-02

### Fixed
- Hubs item details now including derivative URN (kudos to [liskaj](http://github.com/liskaj)!)

## [8.0.13] - 2020-01-28

### Fixed
- NPM token for publishing now encrypted into Travis config

## [8.0.12] - 2020-01-28

### Changed
- POST/PUT/PATCH requests no longer limited by 10MB size
- Additional settings for Design Automation activities

### Fixed
- Upgraded dependencies to resolve audit warnings

## [8.0.11] - 2019-12-10

### Added
- Support for getting/setting/deleting Design Automation v3 nicknames

## [8.0.10] - 2019-12-05

### Fixed
- Endpoint when requesting details of Data Management item version (thanks @AlexPiro!)

## [8.0.9] - 2019-12-05

### Added
- Support for filtering BIM360 issues by owner

## [8.0.8] - 2019-11-21

### Added
- Support for retrieving various Model Derivative data as readable stream

## [8.0.7] - 2019-11-20

### Added
- Design Automation now supports its own availability regions

## [8.0.6] - 2019-11-08

### Added
- Getting details of items in BIM360 data management

## [8.0.5] - 2019-11-07

### Added
- BIM360 location pagination

## [8.0.4] - 2019-11-06

### Added
- Getting BIM360 location container ID
- Listing of BIM360 locations

## [8.0.3] - 2019-11-05

### Added
- Pagination of BIM360 issues
- Pagination of issue comments, attachments, and root causes

## [8.0.2] - 2019-11-05

### Added
- Listing BIM360 users
- Searching BIM360 users using filters

## [8.0.1] - 2019-11-04

### Added
- Retrieving BIM360 issue container IDs
- Support for issue filtering

## [8.0.0] - 2019-11-02

### Added
- Refreshing tokens
- Listing, creating, updating BIM 360 issues, their comments, attachments, issue types, root causes, etc.

### Changed
- Renamed other BIM 360 methods to be consistend with other clients
- Added pagination support to other BIM 360 methods

## [7.3.0] - 2019-11-01

### Added
- Basic support for listing BIM360 issues and issue types
  - Note: the BIM360 client is **experimental**! It needs a lot of cleanup (pagination, restructuring the response JSON, etc.)

### Fixed
- Missing '/' in 3-legged redirect URL.
- Response when retrieving user profile

## [7.2.1] - 2019-10-17

### Fixed
- Added missing token scope

## [7.2.0] - 2019-10-17

### Added
- Deleting buckets

## [7.1.2] - 2019-10-09

### Fixed
- Typo when retrieving webhook ID

## [7.1.1] - 2019-10-09

### Added
- Helper methods for mapping webhook systems to events, and events to scopes

### Fixed
- When creating a single webhook, the method only returns the webhook ID, not the entire object

## [7.1.0] - 2019-10-09

### Added
- Listing & enumerating webhooks
- Creating, updating, and deleting webhooks

## [7.0.0] - 2019-10-07

### Removed
- Utilities for parsing SVFs and writing glTF
  - These are now available in a standalone package [forge-convert-utils](https://www.npmjs.com/package/forge-convert-utils)

## [6.6.0] - 2019-10-04

### Added
- Basic support for serializing SVF content into glTF (2.0)

## [6.5.0] - 2019-10-04

### Added
- Parsing entire SVF into memory

## [6.4.0] - 2019-10-04

### Added
- Listing SVF image assets
- Parsing and querying SVF property database

## [6.3.0] - 2019-10-03

### Added
- Parsing lines and points from SVFs

## [6.2.0] - 2019-09-26

### Added
- Higher-level utility class for parsing SVF both from local file system,
and from Model Derivative service
- Support for extracting additional assets embedded in the root SVF file

## [6.1.0] - 2019-09-25

### Added
- Typings for parsed SVF materials
  - Note: breaking change of the `parseMaterials` function signature
- Support for parsing more material properties & textures

## [6.0.2] - 2019-09-24

### Fixed
- SVF materials only parsed when available

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
