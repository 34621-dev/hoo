//Adelia Vivian Conscetta//



REFATORAÇÃO DO HOOK useTasks.ts


1. ELIMINAÇÃO DE CÓDIGO DUPLICADO

PROBLEMA IDENTIFICADO

As funções createTask e updateTask repetiam:

validação de título
controle de estado (submitting/loading)
try/catch
tratamento de erro

Isso gera:

código mais difícil de manter
maior chance de inconsistência
duplicação desnecessária

SOLUÇÃO APLICADA

Foram criadas duas funções auxiliares:

1. validateTitle()
   Centraliza a validação do título.

2. execute()
   Centraliza:

    loading/submitting
    tratamento de erro
    try/catch/finally

BENEFÍCIOS

menos repetição
manutenção mais simples
comportamento consistente
código mais limpo e legível


2. FUNÇÃO GENÉRICA DE REQUISIÇÃO

PROBLEMA IDENTIFICADO

Todas as funções faziam fetch com estrutura semelhante:

headers
JSON.stringify
response.ok
tratamento de erro
response.json

Isso repetia muita lógica de infraestrutura.

SOLUÇÃO APLICADA

Foi criada a função:

request<T>()

Ela centraliza:

fetch
headers
parsing
tratamento de erro
retorno tipado

Também foi criada uma camada:

tasksApi

Com métodos:

getAll
create
update
remove

BENEFÍCIOS

código desacoplado
menos repetição
melhor reutilização
API padronizada
mais fácil trocar fetch futuramente

3. USO DE useCallback


PROBLEMA IDENTIFICADO

As funções eram recriadas a cada render.

Isso pode causar:

re-renderizações desnecessárias
perda de memoização em componentes filhos
pior performance

SOLUÇÃO APLICADA

Todas as funções públicas do hook foram encapsuladas com:

useCallback()

Funções aplicadas:

fetchTasks
createTask
updateTask
toggleTask
deleteTask
validateTitle
execute

BENEFÍCIOS

referências estáveis
menos renders desnecessários
melhor integração com React.memo/useEffect


4. ATUALIZAÇÃO OTIMISTA DE ESTADO


PROBLEMA IDENTIFICADO

Após qualquer operação:

create
update
delete
toggle

o hook fazia fetchTasks() novamente.

Problemas disso:

mais requisições
pior performance
experiência menos fluida
tráfego desnecessário

SOLUÇÃO APLICADA

O estado local passou a ser atualizado diretamente.

CREATE

adiciona nova task ao estado

UPDATE

atualiza apenas o item alterado

DELETE

remove diretamente da lista

TOGGLE

atualização otimista imediata
rollback em caso de erro

BENEFÍCIOS

menos chamadas à API
UI mais rápida
experiência mais responsiva
menor custo de rede


5. SEPARAÇÃO DE RESPONSABILIDADES
ANÁLISE
O hook fazia:

gerenciamento de estado
comunicação HTTP
parsing de erro
lógica de negócio

Isso mistura responsabilidades.

SOLUÇÃO APLICADA

Foi criada uma camada tasksApi.

Agora:

tasksApi:

comunicação com backend

useTasks:

gerenciamento de estado
comportamento da UI
atualização otimista

BENEFÍCIOS

arquitetura mais limpa
maior reutilização
testes mais fáceis
manutenção simplificada

CONCLUSÃO

A nova implementação apresenta:

menos duplicação
melhor separação de responsabilidades
menos requisições desnecessárias
melhor performance
melhor legibilidade
melhor manutenção
melhor experiência do usuário

Além disso, o código ficou mais escalável para futuras funcionalidades.

