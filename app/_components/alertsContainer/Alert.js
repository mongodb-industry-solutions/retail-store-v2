"use client";
import { removeAlert } from "@/redux/slices/AlertSlice";
import Image from "next/image";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

/*
  ALERT TYPES:
    - success
    - note
    - warning
    - important
    - progress
*/

const Alert = (props) => {
  const dispatch = useDispatch();
  let { id, title, message, type, duration } = props;

  useEffect(() => {
    if (duration > 0) {
      //console.log(id, duration)
      const timeout = setTimeout(() => {
        dispatch(removeAlert(id));
      }, duration);
      return () => clearTimeout(timeout); // Clean up the timeout if the component unmounts
    }
  }, [dispatch]);

  return (
    <div key={id} className={`my-alert`}>
      {!props.imageUrl && <div className={`alert-icon alert-${type}`}></div>}
      {props.imageUrl && (
        <Image
          src={props.imageUrl}
          alt={title}
          width={100}
          height={100}
          priority={true}
          style={{
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      )}
      <div className="w-100">
        <strong>{title}</strong> <br></br>
        {message}
      </div>
    </div>
  );
};

export default Alert;
