import Button from '@leafygreen-ui/button'
import Icon from '@leafygreen-ui/icon'
import React from 'react'

const NotificationItem = ({item}) => {
  return (
    <div className='NotificationItem' style={{
      display: 'flex',
      gap: '16px',
      padding: '16px',
      borderRadius: '8px',
      backgroundColor: item.redeemed ? '#f5f5f5' : '#fff',
      position: 'relative',
    }}>
      {/* Left Column - Title and Message Rows */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Top Row - Title */}
        <div style={{
          fontWeight: 'bold',
          fontSize: '16px',
          color: '#333',
          lineHeight: '1.3'
        }}>
          {item.action.title}
        </div>
        
        {/* Bottom Row - Message */}
        <div style={{
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          {item.action.message}
        </div>
      </div>

      {/* Right Column - Image and Button */}
      <div style={{
        flexShrink: 0,
        width: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Image/Icon Row */}
        <div style={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f8f8',
          borderRadius: '8px'
        }}>
          {item.action.product?.imageUrl ? (
            <img 
              src={item.action.product.imageUrl} 
              alt={item.action.product.productName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          ) : (
            <Icon glyph={item.action.icon} size="default" />
          )}
        </div>

        {/* Button Row */}
        <Button 
          size='xsmall' 
          variant={item.redeemed ? 'default' : 'primary'}
          disabled={item.redeemed}
          onClick={() => console.log(item)}
        >
          {item.redeemed ? 'Redeemed' : 'Redeem'}
        </Button>
      </div>
    </div>
  )
}

export default NotificationItem