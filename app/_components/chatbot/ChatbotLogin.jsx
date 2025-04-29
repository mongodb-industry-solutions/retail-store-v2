import React from 'react'
import { useDispatch } from 'react-redux';

import { setAllowChatbot } from '@/redux/slices/ChatbotSlice';
import { chatbotLogin } from '@/lib/api';

const ChatbotLogin = () => {
    const dispatch = useDispatch();

    const loginToChatbot = () => {
        const email = document.getElementById('chatbotInput').value
        if (email.length > 0 && email.includes('@mongodb.com')){
            dispatch(setAllowChatbot(true))
            chatbotLogin(email)
        }
        else{
            alert('Please enter an email')
        }
    }
    const onKeyDownInput = (e) => {
        if(e.key === 'Enter')
            loginToChatbot()
    }
    return (
        <div>
            <p>Thanks for using our Leafy chatbot</p>
            <p><strong>Please enter your e-mail</strong></p>
            <input type='email' id='chatbotInput' placeholder='john.smith@mongodb.com' onKeyDown={(e) => onKeyDownInput(e)}></input>
            <button type='' onClick={() => loginToChatbot()}>Submit</button>
        </div>
    )
}

export default ChatbotLogin