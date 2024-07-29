import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { Messages } from 'primereact/messages'
import { ListBox } from 'primereact/listbox'
import { Dialog } from 'primereact/dialog'
import { Navigate } from 'react-router-dom'
import { Accordion, AccordionTab } from 'primereact/accordion'
import React, { Component } from 'react'
import Loading from '../Loading'
import { acessaInfoUA } from '../../controllers/UserAdminCTR'
import { acessaListaSoftSkills, registrarTesteProficiencia, acessaListaTestesProficiencia, deletaTesteProficiencia, editaTesteProficiencia } from '../../controllers/ServicosGeraisCTR'

export default class TestesProfAdmin extends Component {
    constructor(props){
        super(props)
        this.state = {
            criarTeste: false,
            listarTestes: false,
            logado: true,
            destinoSaida: ''
        }
    }

    escolherPesquisar = () => {
        this.setState({criarTeste: false, listarTestes: true})
    }

    escolherCriar = () => {
        this.setState({criarTeste: true, listarTestes: false})
    }

    sairConta = (destino) => {
        sessionStorage.removeItem('usuarioAdmin')
        dispatchEvent(new Event('storage'))
        this.setState({ logado: false, destinoSaida: destino })
    }

    render() {
        const estado = this.state
        if(!estado.logado) return <Navigate to={estado.destinoSaida}/>
        return (
        <div className='grid'>
            <div className="col-2 p-5">
                <Button
                label='Lista de Testes'
                icon='pi pi-list'
                className='border-round-lg block m-1'
                onClick={this.escolherPesquisar}/>
                <Button
                label='Criar Teste'
                icon='pi pi-plus'
                className='border-round-lg block m-1'
                onClick={this.escolherCriar}/>
            </div>
            <div className='col-10'>
                {
                    estado.criarTeste ? <h1>Criação de Teste de Proficiência</h1> :
                    estado.listarTestes ? <h1>Lista de Testes de Proficiência</h1> : <h1>Selecione uma opção</h1>
                }
                {
                    this.state.criarTeste ? <MontaTesteP sairConta={this.sairConta}/> :
                    this.state.listarTestes ? <ListarTesteP sairConta={this.sairConta}/> : null
                }
            </div>
        </div>
        )
    }
}

//---------------------Classes de Listagem de Testes de Proficiência---------------------//

class ListarTesteP extends Component {
    constructor(props){
        super(props)
        this.state = {
            testes: [],
            accIndex: -1,
            msg: false
        }
    }

    montaComponentes = (accIndex) => {
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        acessaListaTestesProficiencia(token, tipoUsuario)
        .then(response => {
            if(response.sucesso){
                let cont = 0
                const testes = response.pacote.map(t => {
                    cont++
                    return(
                        <AccordionTab key={cont} tabIndex={cont} header={t.nomeTeste}>
                            <ComponenteLista idCL={cont} dadosTeste={t} refrescaPagina={this.refrescaPagina} sairConta={this.props.sairConta}/>
                        </AccordionTab>
                    )
                })
                this.setState({testes, accIndex})
            }
            else{
                if(response.caso === 'expirado'){
                    alert(response.pacote)
                    this.props.sairConta('/login')
                }
                else if (response.pacote.detail.toLowerCase().includes('nenhum')){
                    this.mensagem.replace(response.pacote)
                    this.setState({msg: true})
                }
                else this.toast.replace(response.pacote)
            }
        })
    }

    refrescaPagina = (pacote, accIndex) => {
        this.toast.replace(pacote)
        this.montaComponentes(accIndex ? accIndex : -1)
    }

    componentDidMount(){
        this.montaComponentes()
    }

    render() {
        return (
        <div className='mr-3'>
            {
                !this.state.msg &&
                (
                    this.state.testes.length === 0 ? <Loading/> :
                    <Accordion activeIndex={this.state.accIndex >= 0 ? this.state.accIndex : null}>
                        {this.state.testes}
                    </Accordion>
                )
            }
            <Toast ref={el => this.toast = el} position='top-right'/>
            <Messages ref={(el) => this.mensagem = el}/>
        </div>
        )
    }
}

class ComponenteLista extends Component {
    constructor(props){
        super(props)
        this.state = {
            idCL: 0,
            idTeste: 0,
            nomeTeste: '',
            descricaoTeste: '',
            questoes: [],
            alternativas: [],
            editando: false
        }
    }

    fecharEdicao = () => {
        this.setState({editando: false})
    }

    refrescaPagina = (pacote, accIndex) => {
        this.setState({editando: false})
        this.props.refrescaPagina(pacote, accIndex)
    }

    deletarTeste = async () => {
        const { idTeste } = this.state
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        const { sucesso, pacote, caso } = await acessaInfoUA(token, tipoUsuario)
        if(sucesso){
            deletaTesteProficiencia(token, tipoUsuario, idTeste)
            .then(response => {
                if(!response.sucesso && response.caso === 'expirado'){
                    alert(response.pacote)
                    this.props.sairConta('/login')
                }
                else this.props.refrescaPagina(response.pacote)
            })
        }
        else{
            if(caso === 'expirado'){
                alert(pacote)
                this.props.sairConta('/login')
            }
            else this.props.refrescaPagina(pacote)
        }
    }

    componentDidMount(){
        const { idCL, idTeste, nomeTeste, descricaoTeste, questoes, alternativas } = this.props.dadosTeste
        this.setState({
            idCL,
            idTeste,
            nomeTeste,
            descricaoTeste,
            questoes,
            alternativas
        })
    }

    render(){
        const estado = this.state
        return(
            <div>
                <div>
                   <h3>Nome do Teste</h3>
                    <InputText
                    className='border-round-lg w-8'
                    value={estado.nomeTeste}
                    onChange={e => this.setState({nomeTeste: e.target.value})}
                    disabled/> 
                </div>
                <div className='mb-3'>
                    <h3>Descrição do Teste</h3>
                    <InputTextarea
                    className='border-round-lg w-10'
                    value={estado.descricaoTeste}
                    onChange={e => this.setState({descricaoTeste: e.target.value})}
                    disabled/>
                </div>
                <div className='border-solid border-300 border-round-lg p-3'>
                    <h3>Questões</h3>
                    {
                        estado.questoes.map((q, i) => {
                            const alts = estado.alternativas.filter(a => a.idQuestao === q.idQuestao)
                            return(
                                <div key={q.idQuestao} className='border-solid border-200 border-round-lg p-3 mb-2'>
                                    <h4>Questão {i + 1}</h4>
                                    <div className='p-inputgroup'>
                                        <span className='p-inputgroup-addon'>
                                            Enunciado:
                                        </span>
                                        <InputTextarea
                                        value={q.enunciado}
                                        disabled/>
                                    </div>
                                    <div className='p-inputgroup'>
                                        <span className='p-inputgroup-addon'>
                                            Valor:
                                        </span>
                                        <InputText
                                        value={q.valorQ}
                                        disabled/>
                                    </div>
                                    <div className='p-inputgroup'>
                                        <span className='p-inputgroup-addon'>
                                            Soft Skill Associada:
                                        </span>
                                        <InputText
                                        value={q.nomeSoftSkill ? q.nomeSoftSkill : 'Nenhuma Soft Skill Associada'}
                                        disabled/>
                                    </div>
                                    <h4>Alternativas</h4>
                                    {
                                        alts.map((a, i) => {
                                            return(
                                                <div key={a.idAlternativa} className='border-solid border-50 border-round-lg p-3 mb-2'>
                                                    <div className='flex flex-row justify-content-between align-items-center'>
                                                        <h5>Alternativa {i + 1}</h5>
                                                        {
                                                            a.idAlternativa === q.alternativaCorreta ?
                                                            <i className='pi pi-check bg-teal-300 text-white p-2 border-circle'/> :
                                                            null
                                                        }
                                                    </div>
                                                    <div className='p-inputgroup'>
                                                        <span className='p-inputgroup-addon'>
                                                            Texto da Alternativa:
                                                        </span>
                                                        <InputTextarea
                                                        value={a.texto}
                                                        disabled/>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <div className='flex flex-row justify-content-between mt-3'>
                    <Button
                    className='border-round-lg'
                    severity='info'
                    label='Editar Teste'
                    onClick={() => this.setState({editando: true})}/>
                    <Button
                    className='border-round-lg'
                    severity='danger'
                    label='Deletar Teste'
                    onClick={() => {
                        window.confirm('Tem certeza que deseja deletar esse Teste?') &&
                        this.deletarTeste()
                    }}/>
                </div>
                <Dialog maximized header='Editando Teste de Proficiência' visible={estado.editando} onHide={() => { if(!estado.editando) return; this.setState({editando: false})}}>
                    <MontaTesteP dadosTeste={estado} idCL={estado.idCL} refrescaPagina={this.refrescaPagina} fecharEdicao={this.fecharEdicao}/>
                </Dialog>
            </div>
        )
    }
}

//---------------------Classes de Criação de Teste de Proficiência---------------------//

class MontaTesteP extends Component {
    constructor(props){
        super(props)
        this.state = {
            idTeste: 0,
            nomeTeste: '',
            descricaoTeste: '',
            softSkills: [],
            questoes: [],
            alternativas: [],
            contaComponents: 0,
            questComponents: [],
            questsIDs: 0,
            editando: false,
            carregando: true
        }
    }

    transeferirDadosQ = (quest) => {
        console.log('Entrei em transeferirDadosQ()')
        const insercao = {
            idQuestao: quest.idQuestao,
            enunciado: quest.enunciado,
            valorQ: quest.valorQ,
            alternativaCorreta: quest.alternativaCorreta,
            softSkillSelecionada: quest.softSkillSelecionada
        }
        const aux = this.state.questoes.map(q => q)
        for(let i = 0; i < aux.length; i++){
            if(aux[i].idQuestao === insercao.idQuestao){
                aux[i] = insercao
                this.setState({questoes: aux})
                break
            }
        }
    }

    transeferirDadosA = (alt) => {
        // console.log('Entrei em transeferirDadosA()')
        const insercao = {
            idQuestao: alt.idQuestao,
            idAlternativa: alt.idAlternativa,
            texto: alt.texto
        }
        const aux = this.state.alternativas.map(a => a)
        for(let i = 0; i < aux.length; i++){
            if(aux[i].idQuestao === insercao.idQuestao && aux[i].idAlternativa === insercao.idAlternativa){
                aux[i] = insercao
                this.setState({alternativas: aux})
                break
            }
        }   
    }

    adicionarQuestao = () => {
        // console.log('Entrei em adicionarQuestao()')
        const idQ = this.state.questsIDs + 1
        const questaoInsercao = {
            idQuestao: idQ,
            enunciado: '',
            valorQ: 0,
            alternativaCorreta: 0,
        }
        this.setState({
            questoes: [...this.state.questoes, questaoInsercao],
            contaComponents: this.state.contaComponents + 1,
            questsIDs: idQ
        })
    }

    adicionarAlternativa = (idQ, idA) => {
        // console.log('Entrei em adicionarAlternativa()')
        const alternativaInsercao = {
            idQuestao: idQ,
            idAlternativa: idA,
            texto: ''
        }
        this.setState({
            alternativas: [...this.state.alternativas, alternativaInsercao],
            contaComponents: this.state.contaComponents + 1
        })
    }

    excluirQuestao = (idQ) => {
        // console.log('Entrei em excluirQuestao()')
        const novasQuestoes = this.state.questoes.filter(q => q.idQuestao !== idQ)
        const novasAlternativas = this.state.alternativas.filter(a => a.idQuestao !== idQ)
        this.setState({
            questoes: novasQuestoes,
            alternativas: novasAlternativas,
            contaComponents: this.state.contaComponents - 1
        })
    }

    excluirAlternativa = (idQ, idA) => {
        // console.log('Entrei em excluirAlternativa()')
        const novasAlternativas = this.state.alternativas.filter(a => a.idQuestao !== idQ || a.idAlternativa !== idA)
        const quests = this.state.questoes.map(q => q)
        for(let i = 0; i < quests.length; i++){
            if(quests[i].idQuestao === idQ && quests[i].alternativaCorreta === idA){
                quests[i].alternativaCorreta = 0
                break
            }
        }
        this.setState({
            alternativas: novasAlternativas,
            contaComponents: this.state.contaComponents - 1,
            questoes: quests
        })
    }

    registarTP = async () => {
        const { nomeTeste, descricaoTeste, questoes, alternativas } = this.state

        // Verifica dados gerais do teste
        if(nomeTeste === ''){
            alert('Preencha o nome do teste')
            return
        }
        if(descricaoTeste === ''){
            alert('Preencha a descrição do teste')
            return
        }
        if(questoes.length === 0){
            alert('Adicione pelo menos uma questão')
            return
        }

        // Verifica dados referentes às questões
        for(let i = 0; i < questoes.length; i++){
            const nQ = i + 1
            if(questoes[i].enunciado === ''){
                alert('Preencha o enunciado da questão ' + nQ)
                return
            }
            if(questoes[i].valorQ === 0){
                alert('Preencha o valor da questão ' + nQ)
                return
            }
            if(questoes[i].softSkillSelecionada === 0){
                alert('Selecione a soft skill da questão ' + nQ)
                return
            }
            let cont = 0
            for(let j = 0; j < alternativas.length; j++){
                if(alternativas[j].idQuestao === questoes[i].idQuestao) cont++
            }
            if(cont < 2){
                alert('Adicione pelo menos duas alternativas para a questão ' + nQ)
                return
            }
            if(questoes[i].alternativaCorreta === 0){
                alert('Marque a alternativa correta da questão ' + nQ)
                return
            }
        }

        // Verifica dados referentes às alternativas
        for(let i = 0; i < alternativas.length; i++){
            if(alternativas[i].texto === ''){
                let nQ
                for(let j = 0; j < questoes.length; j++){
                    if(questoes[j].idQuestao === alternativas[i].idQuestao){
                        nQ = j + 1
                        break
                    }
                }
                alert('Uma das alternativas da questão ' + nQ + ' está vazia')
                return
            }
        }

        // Registra teste de proficiência
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        const { sucesso, pacote, caso } = await acessaInfoUA(token, tipoUsuario)
        if(sucesso){
            registrarTesteProficiencia(token, tipoUsuario, nomeTeste, descricaoTeste, pacote.email_admin, questoes, alternativas)
            .then(response => {
                if(response.sucesso){
                    this.cancelar()
                    this.toast2.replace(response.pacote)
                }
                else{
                    if(response.caso === 'expirado'){
                        alert(response.pacote)
                        this.props.sairConta('/login')
                    }
                    else this.toast2.replace(response.pacote)
                }
            })
        }
        else{
            if(caso === 'expirado'){
                alert(pacote)
                this.props.sairConta('/login')
            }
            else this.toast2.replace(pacote)
        }        
    }

    editarTP = async () => {
        console.log('Entrei em editarTP()')
        const { idTeste, nomeTeste, descricaoTeste, questoes, alternativas } = this.state

        // Verifica dados gerais do teste
        if(nomeTeste === ''){
            alert('Preencha o nome do teste')
            return
        }
        if(descricaoTeste === ''){
            alert('Preencha a descrição do teste')
            return
        }
        if(questoes.length === 0){
            alert('Adicione pelo menos uma questão')
            return
        }

        // Verifica dados referentes às questões
        for(let i = 0; i < questoes.length; i++){
            const nQ = i + 1
            if(questoes[i].enunciado === ''){
                alert('Preencha o enunciado da questão ' + nQ)
                return
            }
            if(questoes[i].valorQ === 0){
                alert('Preencha o valor da questão ' + nQ)
                return
            }
            if(questoes[i].softSkillSelecionada === 0){
                alert('Selecione a soft skill da questão ' + nQ)
                return
            }
            let cont = 0
            for(let j = 0; j < alternativas.length; j++){
                if(alternativas[j].idQuestao === questoes[i].idQuestao) cont++
            }
            if(cont < 2){
                alert('Adicione pelo menos duas alternativas para a questão ' + nQ)
                return
            }
            if(questoes[i].alternativaCorreta === 0){
                alert('Marque a alternativa correta da questão ' + nQ)
                return
            }
        }

        // Verifica dados referentes às alternativas
        for(let i = 0; i < alternativas.length; i++){
            if(alternativas[i].texto === ''){
                let nQ
                for(let j = 0; j < questoes.length; j++){
                    if(questoes[j].idQuestao === alternativas[i].idQuestao){
                        nQ = j + 1
                        break
                    }
                }
                alert('Uma das alternativas da questão ' + nQ + ' está vazia')
                return
            }
        }

        // Edita teste de proficiência
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        const { sucesso, pacote, caso } = await acessaInfoUA(token, tipoUsuario)
        if(sucesso){
            editaTesteProficiencia(token, tipoUsuario, idTeste, nomeTeste, descricaoTeste, pacote.email_admin, questoes, alternativas)
            .then(response => {
                if(response.sucesso) this.props.refrescaPagina(response.pacote, this.props.idCL)
                else{
                    if(response.caso === 'expirado'){
                        alert(response.pacote)
                        this.props.sairConta('/login')
                    }
                    else this.props.refrescaPagina(response.pacote)
                }
            })
        }
        else{
            if(caso === 'expirado'){
                alert(pacote)
                this.props.sairConta('/login')
            }
            else this.props.refrescaPagina(pacote)
        }
    }

    cancelar = () => {
        this.setState({
            nomeTeste: '',
            descricaoTeste: '',
            questoes: [],
            alternativas: [],
            contaComponents: 0,
            questsIDs: 0
        })
    }

    async componentDidMount(){
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        const { sucesso, pacote, caso } = await acessaListaSoftSkills(token, tipoUsuario)
        if(sucesso){
            this.setState({softSkills: pacote})
        }
        else{
            if(caso === 'expirado'){
                alert('Sua sessão expirou. Faça login novamente')
                this.props.sairConta('/login')
            }
            else{
                this.toast2.replace(pacote)
            }
        }

        if(this.props.dadosTeste){
            const { idTeste, nomeTeste, descricaoTeste, questoes, alternativas } = this.props.dadosTeste
            const questsIDs = Math.max(...questoes.map(q => q.idQuestao))
            this.setState({
                idTeste,
                nomeTeste,
                descricaoTeste,
                questoes,
                alternativas,
                contaComponents: questoes.length + alternativas.length,
                questsIDs,
                editando: true
            })
        }

        this.setState({carregando: false})
    }

    componentDidUpdate(_prevProps, prevState){
        const estado = this.state
        if(estado.contaComponents !== prevState.contaComponents){
            const quests = []
            const dadosQS = estado.questoes
            for(let i = 0; i < dadosQS.length; i++){
                const altsQuestao = []
                const dadosAS = estado.alternativas
                for(let j = 0; j < dadosAS.length; j++){
                    if(dadosAS[j].idQuestao === dadosQS[i].idQuestao){
                        altsQuestao.push(dadosAS[j])
                    }
                }
                const questao = (
                    <Questao
                    key={i + 1}
                    nQuestao={i + 1}
                    softSkills={estado.softSkills}
                    dadosQuestao={dadosQS[i]}
                    dadosAlternativas={altsQuestao}
                    transQ={this.transeferirDadosQ}
                    transA={this.transeferirDadosA}
                    adicionarAlternativa={this.adicionarAlternativa}
                    excluirAlternativa={this.excluirAlternativa}
                    excluirQuestao={this.excluirQuestao}
                    editando={estado.editando}/>
                )
                quests.push(questao)
            }
            this.setState({questComponents: quests})
        }
    }
    
    render() {
        const estado = this.state
        if(estado.carregando) return <Loading/>
        return (
        <div>
            <div className='flex flex-column border-solid border-primary border-round-lg p-5 mr-5'>
                <div className='flex flex-column mb-3'>
                    <label className='mb-1 ml-1'>Nome do Teste</label>
                    <InputText
                    className='border-round-lg'
                    type='text'
                    value={estado.nomeTeste}
                    onChange={e => this.setState({nomeTeste: e.target.value})}/>
                </div>
                <div className='flex flex-column'>
                    <label className='mb-1 ml-1'>Descrição do Teste</label>
                    <InputTextarea
                    className='border-round-lg'
                    value={estado.descricaoTeste}
                    onChange={e => this.setState({descricaoTeste: e.target.value})}/>
                </div>
                <div>
                    <h2>Questões</h2>
                    <div className='flex flex-column border-solid border-primary border-round-lg p-5'>
                        {estado.questComponents} 
                        <div className='flex justify-content-center'>
                           <Button
                            className='border-round-lg'
                            icon='pi pi-plus'
                            onClick={this.adicionarQuestao}/> 
                        </div>
                    </div>
                </div>
                <div className='flex flex-row justify-content-between mt-3'>
                    <Button
                    className='border-round-lg'
                    label={estado.editando ? 'Editar Teste' : 'Registrar Teste'}
                    severity='success'
                    onClick={() => estado.editando ? this.editarTP() : this.registarTP()}/>
                    <Button
                    className='border-round-lg'
                    label='Cancelar'
                    severity='danger'
                    onClick={() => estado.editando ? this.props.fecharEdicao() : this.cancelar()}/>
                </div>
            </div>
            <Toast ref={el => this.toast2 = el} position='top-right'/>
        </div>
        )
    }
}

class Questao extends Component {
    constructor(props){
        super(props)
        this.state = {
            idQuestao: 0,
            enunciado: '',
            valorQ: 0,
            alternativaCorreta: 0,
            posicaoAlternativaCorreta: 0,
            softSkills: [],
            softSkillSelecionada: 0,
            altComponents: [],
            altsIDs: 0
        }
    }

    montaQuestao = () => {
        // console.log('Entrei em montaQuestao()')
        const dadosQ = this.props.dadosQuestao
        const dadosA = this.props.dadosAlternativas
        const alts = []
        for(let i = 0; i < dadosA.length; i++){
            if(dadosQ.alternativaCorreta === 0) this.setState({posicaoAlternativaCorreta: 0})
            else if(dadosA[i].idAlternativa === dadosQ.alternativaCorreta) this.setState({posicaoAlternativaCorreta: i + 1})
            const alternativa = (
                <Alternativa
                key={i + 1}
                nAlternativa={i + 1}
                dadosAlternativa={dadosA[i]}
                marcarAlternativaCorreta={this.marcarAlternativaCorreta}
                transA={this.props.transA}
                excluirAlternativa={this.props.excluirAlternativa}/>
            )
            alts.push(alternativa)
        }
        if(this.props.editando){
            this.setState({
                softSkillSelecionada: dadosQ.softSkillSelecionada ? dadosQ.softSkillSelecionada : 0,
                altsIDs: dadosA.length > 0 ? Math.max(...dadosA.map(a => a.idAlternativa)) : 0
            })
        }
        this.setState({
            idQuestao: dadosQ.idQuestao,
            enunciado: dadosQ.enunciado,
            valorQ: dadosQ.valorQ,
            alternativaCorreta: dadosQ.alternativaCorreta,
            altComponents: alts,
            softSkills: this.props.softSkills,
        })
    }

    marcarAlternativaCorreta = (id) => {
        for(let i = 0; i < this.props.dadosAlternativas.length; i++){
            if(this.props.dadosAlternativas[i].idAlternativa === id){
                this.setState({posicaoAlternativaCorreta: i + 1, alternativaCorreta: id})
                break
            }
        }
    }

    componentDidMount(){
        this.montaQuestao()
    }
    
    componentDidUpdate(prevProps, prevState){
        if(this.state !== prevState) this.props.transQ(this.state)
        if(
            (this.props.dadosQuestao !== prevProps.dadosQuestao) ||
            (this.props.dadosAlternativas !== prevProps.dadosAlternativas)
        ) this.montaQuestao() 
    }

    render() {
        const estado = this.state
        return (
            <div className='border-solid border-primary border-round-lg p-3 mb-2'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <h3>Questão {this.props.nQuestao}</h3>
                    <Button
                    className='border-round-lg'
                    icon='pi pi-times'
                    severity='danger'
                    onClick={() => this.props.excluirQuestao(estado.idQuestao)}/>
                </div>
                <div className='flex flex-column'>
                    <label>Enunciado</label>
                    <InputTextarea
                    className='border-round-lg'
                    value={estado.enunciado}
                    onChange={e => this.setState({enunciado: e.target.value})}/>
                </div>
                <div className='grid mt-2 mb-2 justify-content-between'>
                    <div className="col-6 flex flex-column">
                        <label className='mb-1 ml-1'>Soft Skills</label>
                        <ListBox
                        className='border-round-lg'
                        options={estado.softSkills}
                        optionLabel='nome_soft_skill'
                        optionValue='id_soft_skill'
                        emptyMessage='Nenhuma soft skill encontrada'
                        value={estado.softSkillSelecionada}
                        onChange={e => this.setState({ softSkillSelecionada: e.value })}/>
                    </div>
                    <div className="col-4 flex flex-column mt-3">
                        <div className='mb-3'>
                            <label>Valor da Questão</label>
                            <InputText
                            className='border-round-lg ml-3 text-center'
                            type='number'
                            step={0.5}
                            min={0}
                            max={5}
                            value={estado.valorQ}
                            onChange={e => this.setState({valorQ: e.target.value})}/>
                        </div>
                        <div>
                            <label>Alternativa Correta</label>
                            <b className='border-round-lg border-solid ml-3 pt-1 pb-1 pl-2 pr-2'>
                                {estado.posicaoAlternativaCorreta === 0 ? 'N' : estado.posicaoAlternativaCorreta}
                            </b>
                        </div>
                    </div>
                </div>
                {estado.altComponents}
                <div className='flex justify-content-center mt-3'>
                    <Button
                    className='border-round-lg'
                    icon='pi pi-plus'
                    severity='secondary'
                    onClick={() => {
                        const altID = estado.altsIDs + 1
                        this.props.adicionarAlternativa(estado.idQuestao, altID)
                        this.setState({altsIDs: altID})
                    }}/>
                </div>
            </div>
        )
    }
}

class Alternativa extends Component {
    constructor(props){
        super(props)
        this.state = {
            idQuestao: 0,
            idAlternativa: 0,
            texto: '',
        }
    }

    montaAlternativa = () => {
        const dadosA = this.props.dadosAlternativa
        this.setState({
            idQuestao: dadosA.idQuestao,
            idAlternativa: dadosA.idAlternativa,
            texto: dadosA.texto
        })
    }

    componentDidMount(){
        this.montaAlternativa()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state !== prevState) this.props.transA(this.state)
        if(this.props.dadosAlternativa !== prevProps.dadosAlternativa) this.montaAlternativa()
    }

    render() {
        const estado = this.state
        return (
            <div className='border-solid border-primary border-round-lg pl-3 pr-3 pb-3 mt-2 mb-2'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <h4>Alternativa {this.props.nAlternativa}</h4>
                    <Button
                    className='border-round-lg'
                    icon='pi pi-times'
                    severity='danger'
                    onClick={() => this.props.excluirAlternativa(estado.idQuestao, estado.idAlternativa)}/>
                </div>
                <div className='flex flex-column'>
                    <label className='ml-2'>Texto da Alternativa</label>
                    <InputTextarea
                    className='border-round-lg'
                    type='text'
                    value={estado.texto}
                    onChange={e => this.setState({texto: e.target.value})}/>
                </div>
                <Button
                className='mt-3'
                label='Correta'
                severity='secondary'
                onClick={() => this.props.marcarAlternativaCorreta(estado.idAlternativa)}/>
            </div>
        )
    }
}