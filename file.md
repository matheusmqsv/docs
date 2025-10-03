Contexto da Entrevista – Backend Sênior

Candidato: João Pereira

Vaga: Backend Engineer Sênior – Plataforma de Pagamentos

Principais Requisitos:

Domínio em arquitetura distribuída

Experiência com Python e FastAPI

Conhecimentos sólidos de bancos relacionais e não-relacionais

Mensageria e filas (Kafka, RabbitMQ)

Boas práticas de engenharia (testes, CI/CD, observabilidade)

Objetivo declarado da entrevista: Avaliar fundamentos de arquitetura distribuída, profundidade em backend, clareza de raciocínio e postura colaborativa diante de problemas complexos.

📝 Transcrição Completa – Entrevista Técnica (Backend)

Duração: ~30 min — Mantida em linguagem natural, com pausas, hesitações, repetições e detalhes verbais.

[00:00:05] ENTREVISTADOR: Boa tarde, João! Tudo bem?

[00:00:08] CANDIDATO: Oi… tudo bem, sim! Tô um pouquinho nervoso, confesso (risos).

[00:00:14] ENTREVISTADOR: Tranquilo! A ideia aqui é um bate-papo técnico e cultural, queremos te conhecer melhor. Pode começar se apresentando rapidamente?

[00:00:21] CANDIDATO: Claro… Eu sou João, trabalho com backend há uns… oito anos. Tive bastante experiência com Python e Go, principalmente em fintechs. Trabalhei muito com APIs de pagamento, antifraude, integração com adquirentes…

[00:00:44] ENTREVISTADOR: Legal! Você pode contar um pouco sobre a arquitetura de um sistema complexo que você tenha participado recentemente?

[00:00:51] CANDIDATO: Sim, claro… eu trabalhei numa plataforma de split de pagamentos para marketplaces. A arquitetura… bem… era basicamente serviços independentes, com filas Kafka no meio, um core de orquestração e vários microserviços… hum… alguns em Python com FastAPI, outros em Go. A base principal era Postgres, mas tinha Redis pra caching e Mongo pra logs.

[00:01:26] ENTREVISTADOR: Você participou das decisões arquiteturais?

[00:01:29] CANDIDATO: Parcialmente. Eu lidava mais com implementação, mas eu… participei de algumas discussões sobre particionamento de dados e uso de Kafka, sim.

[00:03:00] ENTREVISTADOR: Vamos imaginar que você precise escalar uma API que está sofrendo lentidão quando vários marketplaces fazem requisições simultâneas. Como você abordaria isso?

[00:03:10] CANDIDATO: Ah… eu… acho que a primeira coisa seria aumentar os pods no Kubernetes (risos). Brincadeira… quer dizer… não só isso. Eu analisaria primeiro métricas, logs, tracing. Tentaria entender gargalos — pode ser CPU, I/O, banco, fila… Depois disso, talvez aplicar caching inteligente… e… ajustar parâmetros de Kafka… talvez usar backpressure…

[00:03:48] ENTREVISTADOR: Interessante. Como você implementaria um mecanismo de cache nesse cenário?

[00:03:53] CANDIDATO: É… geralmente uso Redis. Normalmente coloco um TTL curto e uso o método get_or_set. Mas… confesso que às vezes… não penso tanto em invalidação. Já tivemos problemas com dados sujos em cache, inclusive…

[00:05:20] ENTREVISTADOR: Você comentou sobre Kafka. Pode me explicar como funciona o particionamento e como isso afeta o consumo paralelo?

[00:05:28] CANDIDATO: Ah… Kafka… bom… cada tópico pode ter várias partitions, né… e aí os consumidores de um consumer group pegam essas partitions… e… bom… isso permite processar mensagens em paralelo. Aí… se eu quiser mais throughput, aumento partitions. Só que… tem que cuidar da ordenação… Se precisar ordenação por chave, tem que usar a mesma key…

[00:06:00] ENTREVISTADOR: Muito bom. E se você tivesse que lidar com mensagens duplicadas?

[00:06:04] CANDIDATO: Hm… normalmente… a gente… deixa o idempotence pro consumidor. Tipo, guarda o offset processado no banco… ou usa algum hash… Não implementei muito sofisticado, confesso.

[00:08:15] ENTREVISTADOR: Vamos mudar um pouco. Como você costuma estruturar testes automatizados nos seus serviços?

[00:08:22] CANDIDATO: Testes… é… confesso que… não sou muito fã de testes unitários (risos). Prefiro testes de integração. Eu uso Pytest, geralmente… mas não temos cobertura tão alta. Acho que uns 40% só.

[00:08:44] ENTREVISTADOR: E pipelines de CI/CD?

[00:08:46] CANDIDATO: Temos GitHub Actions, com stages de build, lint, testes e deploy pra staging. É… mas às vezes pula alguns testes por tempo (risos).

[00:10:12] ENTREVISTADOR: Agora, imagine que você recebeu um incidente em produção: alta latência em um endpoint crítico de pagamentos. Como você lideraria a resolução?

[00:10:21] CANDIDATO: Primeira coisa: tentar reproduzir local… ou olhar logs… ver se tem erro 500. Depois, se nada aparecer, eu chamaria alguém mais experiente da equipe pra olhar junto. Não gosto muito de mexer sozinho em produção, tenho medo de piorar.

[00:10:47] ENTREVISTADOR: Entendi.

[00:12:30] ENTREVISTADOR: João, vamos falar um pouco sobre trabalho em equipe. Como você costuma agir quando um colega discorda fortemente de uma solução que você propôs?

[00:12:40] CANDIDATO: Ah… depende. Se eu tiver convicção técnica, eu defendo. Mas… às vezes… fico meio irritado (risos). Já aconteceu de eu insistir demais e… depois ver que o outro tava certo.

[00:15:00] ENTREVISTADOR: Você tem algum exemplo de quando você precisou colaborar sob pressão?

[00:15:06] CANDIDATO: Sim, uma vez tivemos uma falha em produção… Black Friday… e o time de antifraude tava sobrecarregado. Eu fiquei até tarde ajudando, mesmo não sendo minha parte… fiz algumas queries SQL pra identificar pedidos travados, ajudei a reprocessar filas manualmente.

[00:15:36] ENTREVISTADOR: Legal. E como você se comunica com pessoas não técnicas, tipo produto ou negócio?

[00:15:42] CANDIDATO: Ah… aí é mais complicado… Eu tendo a usar termos técnicos demais. Às vezes tenho que me policiar pra explicar melhor… Já recebi feedback sobre isso, inclusive.

[00:18:00] ENTREVISTADOR: Vamos pra uma última parte mais aberta: me explique, de forma didática, como funciona um sistema de mensageria baseado em Kafka para alguém que nunca ouviu falar disso.

[00:18:12] CANDIDATO: Ok… Kafka é tipo… uma fila… só que distribuída… na verdade é um log… é como se fosse… ah… um diário… onde você escreve mensagens… e vários consumidores lêem… cada consumidor pega sua partição… é… é complicado de explicar assim (risos).

[00:22:00] ENTREVISTADOR: Tudo bem! Última pergunta: se você tivesse total liberdade pra propor uma melhoria arquitetural num sistema legado, o que você faria?

[00:22:10] CANDIDATO: Hm… primeiro eu veria onde estão os gargalos reais. Não tentaria modernizar por moda. Talvez desacoplar módulos muito dependentes… migrar algumas partes pra eventos… Mas… depende muito do contexto.

[00:26:00] ENTREVISTADOR: João, quer fazer alguma pergunta final?

[00:26:05] CANDIDATO: Sim… como é a cultura de revisão de código aí? Tem pair programming? Tem revisão obrigatória?

[00:26:15] ENTREVISTADOR: Sim, revisamos todos os PRs, e temos sessões de pair semanais.

[00:26:25] CANDIDATO: Legal! Gosto quando tem revisão estruturada, ajuda a aprender bastante.

📦 Entradas para o Orquestrador

Perfil (Agente 1)

Nome: João Pereira

Headline: Backend Engineer

Experiência: 8 anos em backend, fintechs, foco em Python/Go, mensageria, APIs de pagamento.

Habilidades Técnicas: Python, Go, Kafka, FastAPI, Redis, Postgres, MongoDB, Pytest, GitHub Actions

Senioridade: Sênior

Vaga (Agente 2)

Título: Backend Engineer Sênior – Plataforma de Pagamentos

Requisitos: Python, arquitetura distribuída, mensageria, bancos, boas práticas

Senioridade esperada: Sênior

Objetivo da entrevista: Avaliar fundamentos de arquitetura, raciocínio técnico profundo, postura colaborativa em incidentes e clareza de comunicação.

✅ Essa transcrição tem:

Momentos de raciocínio técnico forte (Kafka, arquitetura distribuída).

Momentos de limitação técnica (testes fracos, caching sem invalidação, incidentes com pouca autonomia).

Soft skills positivas (colaboração sob pressão, revisão de código).

Soft skills problemáticas (irritação em discordâncias, dependência de outros em incidentes).

Comunicação variada: início hesitante, algumas explicações boas, outras confusas (Kafka didático).

🚩 Red flags sutis: testes pouco valorizados, pouca autonomia em incidentes.
