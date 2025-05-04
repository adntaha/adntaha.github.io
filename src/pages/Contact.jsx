import React from "react";
import Layout from "../components/Layout";

function copyOnClick(e) {
  const target = e.currentTarget;
  let text = target.textContent;

  if (!text.startsWith("@")) {
    navigator.clipboard.writeText(text);
    target.innerHTML = "<span class=\"text-neutral-400\">copied!</span>";
  } else {
    text = text.slice(1);
    navigator.clipboard.writeText(text);
    target.innerHTML = "<span class=\"text-neutral-400\">copied!</span>";
    text = "@" + text;
  }

  setTimeout(() => {target.innerHTML = text}, 1000);
}

export default function Contact() {
  return (
    <Layout>
      <div className="flex justify-center items-center size-full p-5 bg-black">
        <div>
          heya there,<br />
          <br />
          let&apos;s talk!<br />
          <br />
          email: <a href="mailto:adnanaidantaha@gmail.com" className="hover:underline">adnanaidantaha@gmail.com</a><br />
          discord: <button onClick={(e) => copyOnClick(e)} alt="copy" className="hover:cursor-pointer">@bota.to</button><br />
          linkedin: <a href="https://www.linkedin.com/in/adntaha" className="hover:underline" target="_blank" rel="noreferrer">in/adntaha</a>
        </div>
      </div>
    </Layout>
  );
}
