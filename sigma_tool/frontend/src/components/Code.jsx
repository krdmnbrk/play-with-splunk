import React, { useEffect } from "react";
import Prism from 'prismjs';
import 'prismjs/components/prism-splunk-spl.min';
import 'prismjs/components/prism-ini.min';
import 'prismjs/components/prism-json.min';
import 'prismjs/components/prism-yaml.min';
// import 'prismjs/themes/prism.min.css'
import "./prism.css"

export default function Code({ code, language }) {
  useEffect(() => {
    Prism.manual = true;
    Prism.highlightAll();
  });
  return (
    <div className="Code">
      <pre>
        <code style={{fontSize: 11, wordWrap: "break-word", wordBreak: "break-all", whiteSpace: "break-spaces"}} className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}