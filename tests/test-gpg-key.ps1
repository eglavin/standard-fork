#!/usr/bin/env pwsh

param (
	[switch] $SkipConfirm = $false,
	[string] $KeyId
)

$CurrentPath = Get-Location
$TestPath = (Join-Path -Path $PSScriptRoot -ChildPath "..\..\fork-version.tests\gpg")
$TempKeyContentPath = (Join-Path -Path $PSScriptRoot -ChildPath "TEST_GPG_KEY_CONTENT.tmp")

$KeyContent = @"
Key-Type: DSA
Key-Length: 1024
Subkey-Type: ECDSA
Subkey-Curve: nistp256
Expire-Date: 0
Name-Real: Fork Version
Name-Email: fork-version@example.com
Passphrase: FORK_VERSION_PASSPHRASE
"@.Trim()

# Functions
#

function ConfirmAction {
	param (
		[string] $Title
	)

	if ($SkipConfirm) {
		return $true
	}

	$Choices = '&Yes', '&No'
	$Decision = $Host.UI.PromptForChoice($Title, "", $Choices, 1)
	return $Decision -eq 0
}

function CreateTestFolder {
	# Create test directory if it doesn't exist
	if (!(Test-Path $TestPath)) {
		New-Item -Path $TestPath -ItemType Directory -Force | Out-Null
	}

	if ((Get-ChildItem -Path $TestPath -Force).Count -ne 0) {
		# Confirm if the test directory should be cleared
		if (ConfirmAction -Title "Clear test directory?") {
			Remove-Item -Path $TestPath\* -Recurse -Force | Out-Null
		}
		else {
			Write-Host "Aborting test"
			exit 1
		}
	}
}

function GenerateGPGKey {
	Write-Host "Generating GPG key"

	# Create temporary file with key content
	New-Item -Path $TempKeyContentPath -ItemType File -Value $KeyContent -Force | Out-Null

	gpg --batch --generate-key $TempKeyContentPath

	if ($LastExitCode -ne 0) {
		Write-Error "Failed to generate GPG key"
		exit 1
	}
	else {
		Remove-Item -Path $TempKeyContentPath -Force | Out-Null
	}

	# Search for the fingerprint
	$SearchPattern = "fpr:+(.*?):"

	$Fingerprints = gpg --list-secret-keys --with-colons |
	Select-String -Pattern "fpr" |
	ForEach-Object {
		[regex]::Match($_.Line, $SearchPattern).Groups[1].Value
	}

	return $Fingerprints[0]
}

# Main
#

function Main() {
	CreateTestFolder

	Set-Location -Path $TestPath

	$GPGKey = $KeyId
	if (([string]::IsNullOrEmpty($GPGKey)) -and (ConfirmAction -Title "Generate a new GPG key?")) {
		$GPGKey = GenerateGPGKey
	}

	if ([string]::IsNullOrEmpty($GPGKey)) {
		Write-Error "GPG key is not set"
		exit 1
	}
	Write-Host "GPG Key: $GPGKey"

	# Initialize a new git repository with GPG signing + create initial test file and commit
	git init --initial-branch=main
	git config user.signingKey $GPGKey
	git config commit.gpgSign true
	git config tag.gpgSign true

	New-Item -Path "package.json" -ItemType File -Value @"
{
  "version": "1.2.3"
}
"@.Trim() | Out-Null

	git add .
	git commit -S -m "chore: init commit"

	Set-Location -Path $CurrentPath

	# Run fork-version script with GPG signing
	pnpm run fork-version --path $TestPath --sign
	pnpm run fork-version --path $TestPath
	pnpm run fork-version --path $TestPath --sign

	Set-Location -Path $TestPath

	# Manually verify the commits and tags
	git --no-pager log --show-signature

	git tag --list | ForEach-Object {
		Write-Host "Verifying tag: $_"
		git verify-tag $_
	}
}

Main

Set-Location -Path $CurrentPath
