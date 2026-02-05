## ADDED Requirements

### Requirement: Automated Windows build on push

A NEW GitHub Actions workflow SHALL automatically build Windows packages when code is pushed to main branches.

- A new workflow file `build-windows.yml` SHALL be created specifically for Windows builds
- Builds SHALL trigger on push to `main` and `develop` branches
- Builds SHALL NOT trigger for documentation-only changes (**.md files, docs/**, openspec/**, .opencode/**)
- The existing `build-packages.yml` workflow SHALL remain unchanged for manual multi-platform builds

#### Scenario: Push to main triggers Windows build

- **WHEN** code is pushed to the `main` branch
- **AND** the push includes non-documentation changes
- **THEN** the Windows build job in `build-windows.yml` runs automatically

#### Scenario: Push to develop triggers Windows build

- **WHEN** code is pushed to the `develop` branch
- **AND** the push includes non-documentation changes
- **THEN** the Windows build job in `build-windows.yml` runs automatically

#### Scenario: Documentation-only push skips build

- **WHEN** code is pushed that only modifies `.md` files or files in `docs/`, `openspec/`, or `.opencode/`
- **THEN** the Windows build job does NOT run

#### Scenario: Existing workflow unchanged

- **WHEN** a user manually triggers `build-packages.yml` via GitHub UI (workflow_dispatch)
- **THEN** all platform builds (Windows, Linux, macOS) run as before

### Requirement: Windows build produces artifacts

The automated Windows build SHALL produce downloadable artifacts.

- Build SHALL produce both `.exe` installer and `.zip` portable package
- Artifacts SHALL be uploaded and available for download from the workflow run

#### Scenario: Artifacts uploaded after build

- **WHEN** the Windows build job completes successfully
- **THEN** Windows packages (.exe and .zip) are available as downloadable artifacts

### Requirement: Build uses correct environment

The automated Windows build SHALL use the same build configuration as documented in README.

- Node.js version SHALL be 25 (matching existing workflow)
- Build command SHALL be `npm run buildWindows` (as per README)
- Dependencies SHALL be installed with `npm install --omit=optional`

#### Scenario: Build environment matches documentation

- **WHEN** the automated Windows build runs
- **THEN** it uses Node.js 25
- **AND** runs `npm run buildWindows`
- **AND** produces the same output as a manual build
