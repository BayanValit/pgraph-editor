<div align="center">
    <img src="./src/favicon.ico" alt="PGraph editor" />
    <h2>PGraph editor</h2>
    <p>Component of the graphical editor of the Petri net</p>
    <hr>
</div>



## Развертывание

1. Выполнить следующие команды:
- `npm install`
- `npm start`

2. Запустить в отдельном cmd `npm run serve` - приложение будет развернуто на http://localhost:8080

## Публикация в github npm registry

1. Выполнить логин: `npm login --scope=@bayanvalit --registry=https://npm.pkg.github.com`. Необходимо использовать [соответствующий токен доступа](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries).
2. Вызвать команду: `npm publish`

## Обновление версии

1. Вызвать команду: `npm version patch|minor|major -m "Version description"`

## Установка в качестве зависимости

1. В корне проекта создать файл `.npmrc` со следующим содержимым:
    ```
    @bayan-valit:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=<PERSONAL ACCESS TOKEN WITH read:packages SCOPE>
    ```
2. Выполнить `npm install @bayanvalit/pgraph-editor`

## Отладка

1. Для отладки используется пакет [debug](https://github.com/debug-js/debug#readme).
2. Текущие модули для отладки:
    * pgraph-editor - верхний уровень
    * pgraph-editor:physics:* - физика
3. Для включения отладки в консоли браузера прописать:

```js
// Выводить сообщения из всех модулей
localStorage.debug = 'pgraph-editor:*'
```

