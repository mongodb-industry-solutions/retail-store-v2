import styles from './homeAddressComp.module.css'; 
import { Body } from '@leafygreen-ui/typography';


const HomeAddressComp = ({address, containerStyle}) => {
    if (!address) {
        return (
            <div className={containerStyle}>
                <Body>
                    No shipping address on file for this customer. Choose a
                    user that has address data before placing a home-delivery
                    order.
                </Body>
            </div>
        );
    }
    const {street_and_number, cp, country, state, city} = address;
    return (
        <div className={containerStyle}>
            <Body><strong>Address: </strong>{street_and_number}, {cp} {city}. {country}</Body>
        </div>
    );
};

export default HomeAddressComp;
