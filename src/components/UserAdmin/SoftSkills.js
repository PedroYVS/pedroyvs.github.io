import React, { Component } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Messages } from 'primereact/messages'
import { Toast } from 'primereact/toast'
import { Dialog } from 'primereact/dialog'
import { Navigate } from 'react-router-dom'
import Loading from '../Loading'
import { registrarSoftSkill, acessaListaSoftSkills, editaSoftSkill, deletaSoftSkill } from '../../controllers/ServicosGeraisCTR'
import { acessaInfoUA } from '../../controllers/UserAdminCTR'

export default class SoftSkills extends Component {
    constructor(props){
        super(props)
        this.state = {
            registrarSoftSkill: false,
            pesquisarSoftSkills: false,
            logado: true,
            destinoSaida: '',
            msg: null
        }
    }

    escolherPesquisar = () => {
        this.setState({registrarSoftSkill: false, pesquisarSoftSkills: true})
    }

    escolherRegistrar = () => {
        this.setState({registrarSoftSkill: true, pesquisarSoftSkills: false})
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
            <div className='col-2 p-5'>
                <Button
                label='Listar Soft Skills'
                icon='pi pi-list'
                className='border-round-lg block m-1'
                onClick={this.escolherPesquisar}/>
                <Button
                label='Registrar Soft Skill'
                icon='pi pi-plus'
                className='border-round-lg block m-1'
                onClick={this.escolherRegistrar}/>
            </div>
            <div className='col-10'>
                {
                    this.state.registrarSoftSkill ? <RegistrarSoftSkill sairConta={this.sairConta}/> :
                    this.state.pesquisarSoftSkills ? <ListaSoftSkill sairConta={this.sairConta}/> : <h1>Selecione uma opção</h1>
                }
            </div>
        </div>
        )
    }
}

class RegistrarSoftSkill extends Component {
    constructor(props){
        super(props)
        this.state = {
            nomeSS: '',
            descricaoSS: '',
        }
    }

    onSubmit = async (e) => {
        e.preventDefault()
        const estado = this.state
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        let { sucesso, pacote, caso } = await acessaInfoUA(token, tipoUsuario)
        if(sucesso){
            registrarSoftSkill(token, tipoUsuario, estado.nomeSS, estado.descricaoSS, pacote.email_admin)
            .then(response => {
                if(!response.sucesso && response.caso === 'expirado'){
                    alert(response.pacote)
                    this.props.sairConta('/login')
                }
                else this.toast.replace(response.pacote)
            }).finally(() => { this.setState({ nomeSS: '', descricaoSS: '' }) })
        }
        else{
            if(caso === 'expirado'){
                alert(pacote)
                this.props.sairConta('/login')
            }
            else this.toast.replace(pacote)
        }
    }

    render() {
        const estado = this.state
        return (
        <div>
            <form onSubmit={this.onSubmit}>
                <h1>Registro de Soft Skill</h1>
                <div className='flex flex-column border-solid border-primary border-round-lg p-4 mr-5'>
                    <div className='flex flex-column mb-3'>
                        <label className='mb-1 ml-1'>Nome da Habilidade</label>
                        <InputText
                        className='border-round-lg'
                        type='text'
                        value={estado.nomeSS}
                        onChange={e => this.setState({nomeSS: e.target.value})}
                        required/>
                    </div>
                    <div className='flex flex-column mb-3'>
                        <label className='mb-1 ml-1'>Descrição</label>
                        <InputTextarea
                        className='border-round-lg'
                        value={estado.descricaoSS}
                        onChange={e => this.setState({descricaoSS: e.target.value})}
                        required/>
                    </div>
                    <div className='flex justify-content-center'>
                    <Button
                        className='border-round-lg'
                        label='Registrar'
                        type='submit'/>  
                    </div>
                </div>
            </form>
            <Toast ref={el => this.toast = el} position='top-right'/>
        </div>
        )
    }
}

class ListaSoftSkill extends Component {
    constructor(props){
        super(props)
        this.state = {
            softSkills: [],
            editarSS: false,
            SSeditando: null,
            msg: false
        }
    }

    montaListaSoftSkills = async () => {
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        const { sucesso, pacote, caso } = await acessaListaSoftSkills(token, tipoUsuario)
        if(sucesso){
            let cont = 0
            const SSs = pacote.map(ss => {
                cont++
                return(
                    <div key={cont} className=' p-3 m-3 border-solid border-primary border-round-lg'>
                        <div className='grid'>
                            <div className='col-4'>
                                <h2><b>Nome</b></h2>
                                <p className='border-solid border-cyan-400 border-round-lg p-2'>{ss.nome_soft_skill}</p>
                            </div>
                            <div className="col-8">
                                <h2><b>Descrição</b></h2>
                                <p className='border-solid border-cyan-100 border-round-lg p-2'>{ss.descricao_soft_skill}</p>
                            </div>
                        </div>
                        <Button
                        className='border-round-lg mr-5'
                        label='Editar'
                        severity='info'
                        onClick={() => this.setState({editarSS: true, SSeditando: ss})}/>
                        <Button
                        className='border-round-lg'
                        label='Deletar'
                        severity='danger'
                        onClick={() => {
                            window.confirm('Tem certeza que deseja deletar essa Soft Skill?') &&
                            this.deletarSoftSkill(ss.id_soft_skill)
                        }}/>
                    </div>
                    
                )
            })
            this.setState({softSkills: SSs})
        }
        else{
            if(caso === 'expirado'){
                alert(pacote)
                this.props.sairConta('/login')
            }
            else{
                this.mensagem.replace(pacote)
                this.setState({msg: true})
            }
        }
    }

    deletarSoftSkill = (id) => {
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        deletaSoftSkill(token, tipoUsuario, id)
        .then(response => {
            if(!response.sucesso && response.caso === 'expirado'){
                alert(response.pacote)
                this.props.sairConta('/login')
            }
            else{
                this.toast2.replace(response.pacote)
                this.montaListaSoftSkills()
            }
        })
    }

    editarSoftSkill = async () => {
        console.log(`Valor de SSeditando: ${this.state.SSeditando}`)
        const { token, tipoUsuario } = JSON.parse(sessionStorage.getItem('usuarioAdmin'))
        editaSoftSkill(token, tipoUsuario, this.state.SSeditando)
        .then(response => {
            if(!response.sucesso && response.caso === 'expirado'){
                alert(response.pacote)
                this.props.sairConta('/login')
            }
            else{
                this.toast2.replace(response.pacote)
                this.montaListaSoftSkills()
            }
        })
        .finally(() => this.setState({ editarSS: false, SSeditando: null }))
    }

    componentDidMount() {
        this.montaListaSoftSkills()
    }

    render() {
        const estado = this.state
        return (
        <div>
            <h1>Lista de Soft Skill</h1>
            {
                !estado.msg &&
                estado.softSkills.length === 0 ? <Loading/> : estado.softSkills
            }
            <Dialog header='Editar Soft Skill' visible={estado.editarSS} onHide={() => { if(!estado.editarSS) return; this.setState({editarSS: false})}}>
                <div className='p-4'>
                    <div className='flex flex-column mb-3'>
                        <label className='mb-1'>Nome: </label>
                        <InputText
                        id='nomeSS'
                        type='text'
                        value={estado.SSeditando ? estado.SSeditando.nome_soft_skill : ''}
                        onChange={e => {
                            const sse = {
                                id_soft_skill: estado.SSeditando?.id_soft_skill,
                                nome_soft_skill: e.target.value,
                                descricao_soft_skill: estado.SSeditando?.descricao_soft_skill
                            }
                            this.setState({ SSeditando: sse })
                        }}/>
                    </div>
                    <div className='flex flex-column mb-5'>
                        <label className='mb-1'>Descricão: </label>
                        <InputTextarea
                        id='descricaoSS'
                        type='text'
                        value={estado.SSeditando ? estado.SSeditando.descricao_soft_skill : ''}
                        onChange={e => {
                            const sse = {
                                id_soft_skill: estado.SSeditando?.id_soft_skill,
                                nome_soft_skill: estado.SSeditando?.nome_soft_skill,
                                descricao_soft_skill: e.target.value
                            }
                            this.setState({ SSeditando: sse })
                        }}/>
                    </div>
                    <div>
                        <Button
                        className='boreder-round-lg mr-3'
                        label='Confirmar Edição'
                        severity='success'
                        onClick={() => this.editarSoftSkill()}/>
                        <Button
                        className='boreder-round-lg'
                        label='Cancelar'
                        severity='danger'
                        onClick={() => this.setState({ editarSS: false, SSeditando: null })}/>
                    </div>
                </div>
            </Dialog>
            <Messages ref={el => this.mensagem = el}/>
            <Toast ref={el => this.toast2 = el} position='top-right'/>
        </div>
        )
    }
}