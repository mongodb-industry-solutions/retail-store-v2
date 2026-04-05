import React from "react";
import JsonTreeViewer from "@/app/_components/jsonTreeViewer/JsonTreeViewer";

const JsonDisplay = ({ data }) => (
  <JsonTreeViewer data={data} className="" />
);

export default JsonDisplay;