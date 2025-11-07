
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { GeistSans } from 'geist/font/sans';
import ClientProvider from './ClientProvider'; // Adjust the path if needed
import LoginComp from './_components/login/LoginComp';
import ChatbotOpener from './_components/chatbot/ChatbotOpener';
import DigitalReceiptComp from './_components/digitalReceipt/DigitalReceiptComp';
import AlertsContainer from './_components/alertsContainer/AlertsContainer';
import Footer from './_components/footer/Footer';

export const metadata = {
  title: 'Home',
  description: '',
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <ClientProvider>
          {children}
          {/* <LoginComp/> */}
          <DigitalReceiptComp/>
           <ChatbotOpener/>
          <AlertsContainer/>
        </ClientProvider>
        <Footer/>
      </body>
    </html>
  )
}
