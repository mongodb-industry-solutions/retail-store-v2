import { Combobox, ComboboxOption } from '@leafygreen-ui/combobox';
import Image from "next/image";

import styles from './bopisComp.module.css';

const BopisComp = ({storeLocations}) => {
  return (
    <div>
      <Combobox
        label="Pick your prefered store location"
        description="Your order will be delivered to this store."
        placeholder="Select a store"
      >
        {
          storeLocations.map((store, index) => 
            <ComboboxOption 
              value={`${store._id}-${index}`} 
              displayName={store.name}
            />
          )
        }
      </Combobox>
    </div>
  );
};

export default BopisComp;
