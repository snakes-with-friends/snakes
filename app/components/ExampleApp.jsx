import React from 'react'
import Modal from 'react-modal'
import Login from './Login'
import SignUpContainer from './SignupContainer'

const customStyles = {
  overlay : {
    position          : 'fixed',
    top               : 300,
    left              : 300,
    right             : 300,
    bottom            : 300,
    backgroundColor   : 'rgba(255, 255, 255, 0.75)'
  },
  content : {
    position                   : 'absolute',
    top                        : '20px',
    left                       : '20px',
    right                      : '20px',
    bottom                     : '20px',
    border                     : '1px solid #ccc',
    background                 : 'grey',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px'

  }
};


export default class ExampleApp extends React.Component{

   constructor(props){
    super(props)

    this.state = {
      loginOrSignup: ''
    }
    // this.openModal = this.openModal.bind(this)
    // this.closeModal = this.closeModal.bind(this)
    this.openLogin = this.openLogin.bind(this)
    this.openSignup = this.openSignup.bind(this)
  }

  openLogin(e){
    this.setState({loginOrSignup: e.target.name})
  }

  openSignup(e){
    this.setState({loginOrSignup: e.target.name})
  }
  // openModal(e){
  //   this.setState({modalIsOpen: true})
  //   this.setState({loginOrSignup: e.target.name})
  // }

  // closeModal(){
  //   this.setState({modalIsOpen: false})
  // }

  render(){
    console.log('EXAMPLE APP STATE', this.state)
    return(
      <div>
        <button id="login-btn" name="login" onClick={this.openLogin}> Login! </button>
        <button id="login-btn" name="signup" onClick={this.openSignup}> Sign up! </button>
    </div>
  )
}

}


// <Modal
//           isOpen={this.state.modalIsOpen}
//           onRequestClose={this.closeModal}
//           style={customStyles}
//           contentLabel="login Modal"
//         >
//         {
//           this.state.loginOrSignup === 'signup' ? <SignUpContainer /> : <Login closeModal={this.closeModal} />
//         }
//         </Modal>
