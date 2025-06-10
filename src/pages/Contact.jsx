import React from "preact";
import Layout from "../components/Layout";

function copyOnClick(e) {
  const target = e.currentTarget;
  let text = target.textContent;

  if (!text.startsWith("@")) {
    navigator.clipboard.writeText(text);
    target.innerHTML = "<span class=\"text-(--accent-inversed)\">copied!</span>";
  } else {
    text = text.slice(1);
    navigator.clipboard.writeText(text);
    target.innerHTML = "<span class=\"text-(--accent-inversed)\">copied!</span>";
    text = "@" + text;
  }

  setTimeout(() => {target.innerHTML = text}, 1000);
}

export default function Contact() {
  return (
    <Layout className="grid grid-cols-1 grid-rows-1">
      <div className="flex justify-center items-center">
        <div className="relative">
          <div className="bg-(--text) text-(--text-inversed) p-5 rounded-xl">
            heya there,<br />
            <br />
            let&apos;s talk!<br />
            <br />
            email: <a href="mailto:adnanaidantaha@gmail.com" className="hover:underline">adnanaidantaha@gmail.com</a><br />
            discord: <button onClick={(e) => copyOnClick(e)} alt="copy" className="hover:cursor-pointer">@bota.to</button><br />
            linkedin: <a href="https://www.linkedin.com/in/adntaha" className="hover:underline" target="_blank" rel="noreferrer">in/adntaha</a>
            {/* top right information emoji */}
            <span className="absolute top-4 right-4 text-5xl pointer-events-none">ℹ️</span>
            <span className="absolute top-4 right-5 size-12 bg-[linear-gradient(to_top_right,var(--text)_25%,transparent_90%)]"></span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
