import Button from '@leafygreen-ui/button'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { redeemNextBestAction } from '@/lib/api'
import { markNextBestActionAsRedeemed } from '@/redux/slices/CustomerRetentionSlice'

const NotificationItem = ({item}) => {
  const [awaitingApiResponse, setAwaitingApiResponse] = useState(false);
  const dispatch = useDispatch();

  const redeemNBA = async () => {
    if (awaitingApiResponse || item.redeemed) return;
    
    setAwaitingApiResponse(true);
    try {
      const res = await redeemNextBestAction(item._id);
      console.log('Redeem NBA response:', res);
      
      // If the update was successful, mark the item as redeemed in Redux
      if (res.modifiedCount === 1) {
        dispatch(markNextBestActionAsRedeemed(item._id));
      }
    } catch (error) {
      console.error('Error redeeming next best action:', error);
    } finally {
      setAwaitingApiResponse(false);
    }
  }

  return (
    <div className={`NotificationItem ${item.redeemed ? 'redeemed' : ''}`}>
      {/* Left Column - Title and Message Rows */}
      <div className="NotificationItem-content">
        {/* Top Row - Title */}
        <div className="NotificationItem-title">
          {item.actionMetadata.title}
        </div>
        
        {/* Bottom Row - Message */}
        <div className="NotificationItem-message">
          {item.actionMetadata.message}
        </div>
      </div>

      {/* Right Column - Image and Button */}
      <div className="NotificationItem-actions">
        {/* Image/Icon Row */}
        <div className={item.actionMetadata.product?.imageUrl ? "NotificationItem-image-container" : ""}>
          {item.actionMetadata.product?.imageUrl ? (
            <img 
              src={item.actionMetadata.product.imageUrl} 
              alt={item.actionMetadata.product.productName}
              className="NotificationItem-product-image"
            />
          ) : (
            // <Icon glyph={item.actionMetadata.icon} size="default" />
            <></>
          )}
        </div>

        {/* Button Row */}
        <Button 
          size='xsmall' 
          variant={item.redeemed ? 'default' : 'primary'}
          disabled={item.redeemed === true || awaitingApiResponse}
          onClick={() => redeemNBA()}
        >
          {awaitingApiResponse ? 'Redeeming...' : (item.redeemed ? 'Redeemed' : 'Redeem')}
        </Button>
      </div>
    </div>
  )
}

export default NotificationItem