Fluxo de realização de tasks:

1- cria branch a partir da develop seguindo o padrão:
[feature/bugfix/hotfix/chore]/[numero da task]-nome-descritivo-da-task
ex: feature/1-create-donator-crud-rest-api

2 - Commite suas alterações no seguitne padrão:
[feat/fix]: descrição das suas alterações

ex: `feat: implement donator module with CRUD operations

- Create donator schema and database table
- Implement create, read, update, and delete use cases
- Add controllers for handling HTTP requests
- Set up routes for donator endpoints
- Introduce error handling with custom error classes
- Add unit and integration tests for donator functionality
- Update documentation to reflect new module structure and usage`

3 - Atualize a versão do projeto no package.json:
versão base 1.0.0
se bugfix -> 1.0.1
se feature -> 1.1.0
se release -> 2.0.0

4 - rode um pnpm install para garantir que seu package.json e pnpm-lock.json estejam atualizados

5 - commite as atualizações de versão

6 - faça o push da sua branch

7 - abra uma pull request no github fazendo o merge da sua branch na develop 

