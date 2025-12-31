# BloodCrown — Gerenciador de Fichas de RPG

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-2b2b2b?logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3-2b2b2b?logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2b2b2b?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8-2b2b2b?logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-2b2b2b?logo=javascript&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Online-success?logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/API-Online-success?logo=spring&logoColor=white" />
</p>

BloodCrown é um gerenciador de fichas desenvolvido para um sistema de RPG autoral, utilizado em mesas entre amigos.

O projeto automatiza cálculos e regras que antes eram feitos manualmente, facilitando o controle dos personagens durante as sessões e reduzindo a dependência de fichas em papel.

Além do uso prático, a aplicação foi construída com foco em arquitetura, boas práticas e tecnologias amplamente utilizadas no mercado, servindo também como projeto de estudo e portfólio full stack.

> Nota: os comentários presentes no código foram elaborados com auxílio do Gemini, com o objetivo de melhorar a clareza e a documentação do projeto.

**Acesse a aplicação online:**
[https://bloodcrown.netlify.app](https://bloodcrown.netlify.app)

---

## Visão Geral

* Aplicação full stack com frontend SPA e backend REST
* Autenticação stateless baseada em JWT
* Persistência em banco de dados relacional
* Containerização completa com Docker
* Deploy em ambiente de nuvem

---

## Preview

<p align="center">
  <img src="frontend/assets/img/Página Dashboard.png" alt="Dashboard do sistema" width="100%">
</p>

<p align="center">
  <img src="frontend/assets/img/Página Ficha.png" alt="Ficha do personagem" width="100%">
</p>

---

## Funcionalidades

### Rolagem de Dados

Cálculo automático da quantidade de dados com base nos atributos e perícias do personagem.

### Inventário

Sistema de equipar e desequipar itens, alterando automaticamente os atributos do personagem e habilitando novas opções de combate.

### Sistema de Combate

Geração dinâmica de cards de ataque de acordo com os equipamentos utilizados.

### Gestão de Recursos

Controle visual de vida, mana e estamina, com ações rápidas para cura e aplicação de dano.

### Autenticação

Sistema completo de registro e login utilizando Spring Security com autenticação stateless baseada em JWT.

### Persistência de Dados

Armazenamento das fichas e informações dos personagens em banco MySQL hospedado em nuvem.

---

## Tecnologias Utilizadas

### Backend

* Java 21
* Spring Boot 3
* Spring Security
* JWT
* Hibernate / JPA
* MySQL 8
* Maven

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)
* Bootstrap 5
* SweetAlert2
* Fetch API

### DevOps e Infraestrutura

* Docker
* Docker Compose
* Render (API)
* Netlify (Frontend)
* Git e GitHub

---

## Executando o Projeto Localmente

Este projeto utiliza Docker para simplificar a execução do ambiente.
Não é necessário ter Java ou MySQL instalados localmente.

### Pré-requisitos

* Git
* Docker

### Passos

1. Clone o repositório:

```bash
git clone https://github.com/R1ck-dev/BloodCrown-CharacterSheet.git
cd BloodCrown-CharacterSheet
```

2. Suba o ambiente com Docker Compose:

```bash
docker-compose up --build
```

O Docker irá baixar as imagens necessárias, compilar o backend e iniciar os containers da aplicação.

### Acesso à aplicação

A aplicação estará disponível em:

```text
http://localhost:8080
```

A porta pode variar de acordo com a configuração do ambiente.

---

## Autor

Desenvolvido por Henrique.

* GitHub: [https://github.com/R1ck-dev](https://github.com/R1ck-dev)
* E-mail: [henriquemarangoni.inacio1108@gmail.com](mailto:henriquemarangoni.inacio1108@gmail.com)
* LinkedIn: [https://www.linkedin.com/in/henrique-marangoni-484845239/](https://www.linkedin.com/in/henrique-marangoni-484845239/)
