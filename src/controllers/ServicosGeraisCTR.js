import axios from 'axios'

const SGServer = axios.create({
    baseURL: 'https://servicos-gerais-tg-9c39f2345a97.herokuapp.com/'
})
// 'http://localhost:6004/'

const msgLife = 6000

export const registrarSoftSkill = async (token, tipoUsuario, NSS, DSS, EmAdmin) => {
    console.log('Entrei na função registrarSoftSkills() em ServicosGeraisCTR')
    console.log(`Dados importantes => Token: ${token}, Tipo de Usuário: ${tipoUsuario}, Nome da Soft Skill: ${NSS}, Descrição da Soft Skill: ${DSS}, Email do Admin: ${EmAdmin}`)
    try{
        await SGServer.post('/registrar-softskill',
            {
                nome_soft_skill: NSS,
                descricao_soft_skill: DSS,
                email_admin: EmAdmin
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    tipoUsuario
                }
            }
        )
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Soft Skill registrada com sucesso', life: msgLife}
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                   return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro no Registro', detail: err.response.data.message, life: msgLife}
                        }
                    ) 
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const acessaListaSoftSkills = async (token, tipoUsuario) => {
    console.log('Entrei na função acessaListaSoftSkills() em ServicosGeraisCTR')
    try{
        const { data } = await SGServer.get('/listar-softskills', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario
            }
        })
        return(
            {
                sucesso: true,
                pacote: data
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro na Listagem', detail: err.response.data.message, sticky: true, closable: false}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', sticky: true, closable: false}
                }
            )
        }
    }
}

export const deletaSoftSkill = async (token, tipoUsuario, idSS) => {
    console.log('Entrei na função deletaSoftSkill() em ServicosGeraisCTR')
    console.log(`Dados importantes => Token: ${token}, Tipo de Usuário: ${tipoUsuario}, ID da Soft Skill: ${idSS}`)
    try{
        await SGServer.delete('/deletar-softskill', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario,
                id_soft_skill: idSS
            }
        })
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Soft Skill deletada com sucesso', life: msgLife}
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro na Deleção', detail: err.response.data.message, life: msgLife}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const editaSoftSkill = async (token, tipoUsuario, SS) => {
    console.log('Entrei na função editarSoftSkill() em ServicosGeraisCTR')
    console.log(`Dados importantes => Token: ${token}, Tipo de Usuário: ${tipoUsuario}, Nome Soft Skill: ${SS.nome_soft_skill}, Descrição Soft Skill: ${SS.descricao_soft_skill}, ID da Soft Skill: ${SS.id_soft_skill}`)
    try{
        await SGServer.put('/editar-softskill', {
            nome_soft_skill: SS.nome_soft_skill,
            descricao_soft_skill: SS.descricao_soft_skill
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario,
                id_soft_skill: SS.id_soft_skill
            }
        })
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Soft Skill editada com sucesso', life: msgLife}
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro na Edição', detail: err.response.data.message, life: msgLife}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const registrarTesteProficiencia = async (token, tipoUsuario, nomeTesteP, descricaoTesteP, emailAdmin, quests, alts) => {
    console.log('Entrei na função registrarTesteProficiencia() em ServicosGeraisCTR')

    // Modifica nomes para ter coerência com o back-end
    const questoes = []
    for(let i = 0; i < quests.length; i++){
        const q = {
            id_questao: quests[i].idQuestao,
            enunciado_questao: quests[i].enunciado,
            valor_questao: parseFloat(quests[i].valorQ),
            alternativa_correta: quests[i].alternativaCorreta,
            id_soft_skill: quests[i].softSkillSelecionada
        }
        questoes.push(q)
    }
    const alternativas = []
    for(let i = 0; i < alts.length; i++){
        const a = {
            id_questao: alts[i].idQuestao,
            id_alternativa: alts[i].idAlternativa,
            texto_alternativa: alts[i].texto
        }
        alternativas.push(a)
    }

    try{
        await SGServer.post('/registrar-teste-proficiencia',
            {
                nome_teste_proficiencia: nomeTesteP,
                descricao_teste_proficiencia: descricaoTesteP,
                email_admin: emailAdmin,
                questoes,
                alternativas
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    tipoUsuario
                }
            }
        )
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Teste de Proficiência registrado com sucesso', life: msgLife}
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro no Registro', detail: err.response.data.message, life: msgLife}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const acessaListaTestesProficiencia = async (token, tipoUsuario) => {
    console.log('Entrei na função acessaListaTestesProficiencia() em ServicosGeraisCTR')
    try{
        const { data } = await SGServer.get('/listar-testes-proficiencia', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario
            }
        })
        console.log(data)
        const entregaView = []
        for(let i = 0; i < data.testes.length; i++){
            const questoes = []
            for(let j = 0; j < data.questoes.length; j++){
                if(data.questoes[j].id_teste_proficiencia === data.testes[i].id_teste_proficiencia){
                    const q = {
                        idQuestao: data.questoes[j].id_questao,
                        enunciado: data.questoes[j].enunciado_questao,
                        valorQ: data.questoes[j].valor_questao,
                        alternativaCorreta: data.questoes[j].alternativa_correta,
                        softSkillSelecionada: data.questoes[j].id_soft_skill,
                        nomeSoftSkill: data.questoes[j].nome_soft_skill
                    }
                    questoes.push(q)
                }
            }
            const alternativas = []
            for(let j = 0; j < data.alternativas.length; j++){
                if(data.alternativas[j].id_teste_proficiencia === data.testes[i].id_teste_proficiencia){
                    const a = {
                        idQuestao: data.alternativas[j].id_questao,
                        idAlternativa: data.alternativas[j].id_alternativa,
                        texto: data.alternativas[j].texto_alternativa
                    }
                    alternativas.push(a)
                }
            }
            const test = {
                idTeste: data.testes[i].id_teste_proficiencia,
                nomeTeste: data.testes[i].nome_teste_proficiencia,
                descricaoTeste: data.testes[i].descricao_teste_proficiencia,
                questoes,
                alternativas
            }
            entregaView.push(test)
        }
        console.log('Lista de Testes de Proficiência')
        console.log(entregaView)
        return(
            {
                sucesso: true,
                pacote: entregaView
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro na Listagem', detail: err.response.data.message, sticky: true, closable: false}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', sticky: true, closable: false}
                }
            )
        }
    }
}

export const deletaTesteProficiencia = async (token, tipoUsuario, idTesteP) => {
    console.log('Entrei na função deletaTesteProficiencia() em ServicosGeraisCTR')
    console.log(`Dados importantes => Token: ${token}, Tipo de Usuário: ${tipoUsuario}, ID do Teste de Proficiência: ${idTesteP}`)
    try{
        await SGServer.delete('/deletar-teste-proficiencia', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                tipoUsuario,
                id_teste_proficiencia: idTesteP
            }
        })
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Teste de Proficiência deletado com sucesso', life: msgLife}
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro na Deleção', detail: err.response.data.message, life: msgLife}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
}

export const editaTesteProficiencia = async (token, tipoUsuario, idTeste, nomeTeste, descricaoTeste, emailAdmin, quests, alts) => {
    console.log('Entrei na função editaTesteProficiencia() em ServicosGeraisCTR')

    // Modifica nomes para ter coerência com o back-end
    const questoes = []
    for(let i = 0; i < quests.length; i++){
        const q = {
            id_questao: quests[i].idQuestao,
            enunciado_questao: quests[i].enunciado,
            valor_questao: parseFloat(quests[i].valorQ),
            alternativa_correta: quests[i].alternativaCorreta,
            id_soft_skill: quests[i].softSkillSelecionada
        }
        questoes.push(q)
    }
    const alternativas = []
    for(let i = 0; i < alts.length; i++){
        const a = {
            id_questao: alts[i].idQuestao,
            id_alternativa: alts[i].idAlternativa,
            texto_alternativa: alts[i].texto
        }
        alternativas.push(a)
    }

    try{
        await SGServer.put('/editar-teste-proficiencia',
            {
                id_teste_proficiencia: idTeste,
                nome_teste_proficiencia: nomeTeste,
                descricao_teste_proficiencia: descricaoTeste,
                email_admin: emailAdmin,
                questoes,
                alternativas
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    tipoUsuario,
                    id_teste_proficiencia: idTeste
                }
            }
        )
        return(
            {
                sucesso: true,
                pacote: {severity: 'success', summary: 'Teste de Proficiência editado com sucesso', detail: 'Talvez seja preciso reabrir a aba do teste para ver as alterações', life: msgLife}
            }
        )
    }
    catch(err){
        console.log(err)
        if(err.response){
            switch(err.response.data.name){
                case 'TokenExpirado':
                    return(
                        {
                            sucesso: false,
                            caso: 'expirado',
                            pacote: 'Sua sessão expirou. Faça Login novamente para poder continuar suas atividades'
                        }
                    )
                default:
                    return(
                        {
                            sucesso: false,
                            caso: 'erro',
                            pacote: {severity: 'error', summary: 'Erro na Edição', detail: err.response.data.message, life: msgLife}
                        }
                    )
            }
        }
        if(err.request){
            return(
                {
                    sucesso: false,
                    caso: 'erro',
                    pacote: {severity: 'error', summary: 'Erro Inesperado', detail: 'Tente novamente mais tarde', life: msgLife}
                }
            )
        }
    }
} 