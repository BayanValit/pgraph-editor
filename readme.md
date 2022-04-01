# PGraph editor

Component of the graphical editor of the Petri net

## Development

1. Expand the project in your web server folder and run:
- `npm install`
- `npm start`

2. Run in separate cmd `npm run serve` - it will serve application at http://localhost:8080

## Публикация в github npm registry

1. Выполнить логин: `npm login --scope=@bayan-valit --registry=https://npm.pkg.github.com`. Необходимо использовать [соответствющий токен доступа](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries).
2. Вызвать команду: `npm publish`

## Обновление версии

1. Вызвать команду: `npm version patch|minor|major -m "Version description"`

## Установка в качестве зависимости

1. В корне проекта создать файл `.npmrc` со следующим содержимым:
    ```
    @bayan-valit:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=<PERSONAL ACCESS TOKEN WITH read:packages SCOPE>
    ```
2. Выполнить `npm install @bayan-valit/pgraph-editor`