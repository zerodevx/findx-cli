# findx-cli

> CLI to find and execute command for every glob match

Elegant replacement for [`each-cli`](https://www.npmjs.com/package/each-cli),
[`foreach-cli`](https://www.npmjs.com/package/foreach-cli) and \*nix
[`find -exec`](https://man7.org/linux/man-pages/man1/find.1.html) command in
very little lines of
[code](https://github.com/zerodevx/findx-cli/blob/main/cli.js). Useful for NPM
scripts or CI.

- [x] Cross-platform
- [x] Concurrency support
- [x] Continue on error, then exit with code 1
- [x] Control output of every execution
- [x] Automatically show task progress in TTY

## Install

```
$ npm i -g findx-cli
```

## Usage

```
$ findx '**/*.jpg' -- convert {{path}} {{dir}}/{{name}}.png
```

This searches for all files matching the glob pattern, then runs the provided
command against each match.

See below for more usage [examples](#examples).

## Options

```
Usage: findx <globs> [options] -- [commands...]

CLI to find and execute command for every glob match

Arguments:
  globs                   globs to match
  commands                commands to execute

Options:
  -C, --concurrent <max>  concurrent number of executions (default: 10)
  --log <level>           log level (choices: "stdout", "stderr", "all",
                          "none", default: "all")
  --sh                    run each execution in new shell
  --cd                    change to path directory for each run
  -V, --version           output the version number
  -h, --help              display help for command
```

## Command Templating

Write your command using [mustache](https://github.com/janl/mustache.js/)
syntax. The following tags are exposed:

| Tag        | Eg                      | Desc                     |
| ---------- | ----------------------- | ------------------------ |
| `{{path}}` | /home/user/dir/file.txt | Full path of file        |
| `{{root}}` | /                       | Root                     |
| `{{dir}}`  | /home/user/dir          | Directory portion        |
| `{{base}}` | file.txt                | File name with extension |
| `{{name}}` | file                    | Name portion             |
| `{{ext}}`  | .txt                    | Extension portion        |

## Examples

#### Untar each tar file in its own directory

```
$ findx '**/*.tar' --cd -- tar -xvf {{base}}
```

#### Ignore some files and run shell-specific commands

```
$ findx '**/LICENSE !ignored/**' --sh -- 'cd {{dir}} && cat LICENSE'
```

#### Dry-run glob matches

```
$ findx '**/*.@(txt,xml)'
```

## Development

Standard Github
[contribution workflow](https://github.com/firstcontributions/first-contributions)
applies.

#### Tests

Test specs are in `test/spec.js`. To run the tests:

```
$ npm run test
```

## License

ISC
