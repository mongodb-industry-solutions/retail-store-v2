"use client";

import { useState } from "react";
import { useSelector } from 'react-redux';
import Link from "next/link";

import IconButton from "@leafygreen-ui/icon-button";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Icon from "@leafygreen-ui/icon";
import ListGroup from 'react-bootstrap/ListGroup';

const Profile = () => {
    const [isProfileOpen, setProfileOpen] = useState(false);
    const selectedUser = useSelector(state => state.User.selectedUser)
    const featureInStore = useSelector((state) => state.Global.feature);

    const toggleProfile = () => {
        setProfileOpen(!isProfileOpen);
    };

    return (
        <div id="Profile" className={'profileContainer'}>
            <LeafyGreenProvider onClick={toggleProfile}>
                <IconButton className={'NavbarButtonIcon'} onClick={toggleProfile} aria-label="Toggle Profile">
                    <Icon glyph="Person" />
                </IconButton>
            </LeafyGreenProvider>

            {isProfileOpen && (
                <div className={'profilePopup'}>
                    <ListGroup>
                        <ListGroup.Item className={'listGroupItem'}>
                            <div className="d-flex flex-row">
                                <img src="/rsc/icons/circle-user-solid.svg" alt="Logo" width={18} className="me-1" />
                                <div onClick={() => console.log('selectedUser: ', selectedUser)}>
                                    <p className={'textMyProfile'}>My Profile</p><small>{selectedUser.name} {selectedUser.surname}</small>
                                </div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item className={'listGroupItem'}>
                            <Link href={`/orders?feature=${featureInStore}`}>
                                <div className="d-flex flex-row">
                                    <img src="/rsc/icons/file-lines-solid.svg" alt="Logo" width={15} className="me-1" />
                                    <p>My Orders</p>
                                </div>
                            </Link>
                        </ListGroup.Item>
                        <ListGroup.Item className={'listGroupItem'}>
                            <Link href={`/cart?feature=${featureInStore}`}>
                                <div className="d-flex flex-row">
                                    <img src="/rsc/icons/cart-shopping-solid.svg" alt="Shopping cart" width={18} className="me-1" />
                                    <p>My Cart</p>
                                </div>
                            </Link>
                        </ListGroup.Item>
                    </ListGroup>
                </div>
            )}
        </div>
    )
}

export default Profile;
