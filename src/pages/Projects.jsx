import Layout from "../components/Layout";
import { Link } from "../utils";
import React from "preact";

const projects = [
  {
    image: "https://task.kitchen/assets/embed.png",
    title: "Task Kitchen",
    tools: ["flutter", "android", "ios", "web"],
    link: "https://task.kitchen"
  },

]

function iconPath(tool) {
  switch (tool.toLowerCase()) {
    case "flutter":
      return "M236-345 100-480l440-440h271L236-345ZM540-40 303-277l237-237h271L574-277 811-40H540Z";
    case "android":
      return "M40-240q9-107 65.5-197T256-580l-74-128q-6-9-3-19t13-15q8-5 18-2t16 12l74 128q86-36 180-36t180 36l74-128q6-9 16-12t18 2q10 5 13 15t-3 19l-74 128q94 53 150.5 143T920-240H40Zm240-110q21 0 35.5-14.5T330-400q0-21-14.5-35.5T280-450q-21 0-35.5 14.5T230-400q0 21 14.5 35.5T280-350Zm400 0q21 0 35.5-14.5T730-400q0-21-14.5-35.5T680-450q-21 0-35.5 14.5T630-400q0 21 14.5 35.5T680-350Z";
    case "ios":
      return "M160-600v-80h80v80h-80Zm0 320v-240h80v240h-80Zm280 0h-80q-33 0-56.5-23.5T280-360v-240q0-33 23.5-56.5T360-680h80q33 0 56.5 23.5T520-600v240q0 33-23.5 56.5T440-280Zm-80-80h80v-240h-80v240Zm200 80v-80h160v-80h-80q-33 0-56.5-23.5T560-520v-80q0-33 23.5-56.5T640-680h160v80H640v80h80q33 0 56.5 23.5T800-440v80q0 33-23.5 56.5T720-280H560Z";
    case "web":
      return "M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z";
  }
}

export default function Projects() {
  return (
    <Layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-[min-content]">
      {projects.map((project, index) => {
        return (
          <div key={index} className="border-(--accent) border-2 box-border">
            <img src={project.image} alt={project.title} />
            <div className="bg-(--accent) text-(--text-inversed) p-2.5">
              <div className="flex flex-row justify-between">
                <Link href={project.link}>
                  <h2 className="font-bold text-2xl">
                    {project.title}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" height={24} width={24} fill="currentColor" className="-mt-0.5 ml-2 inline">
                      <path d="M228-110q-49.7 0-83.85-34.15Q110-178.3 110-228v-504q0-49.7 34.15-83.85Q178.3-850 228-850h252v118H228v504h504v-252h118v252q0 49.7-34.15 83.85Q781.7-110 732-110H228Zm190-226-82-82 314-314h-74v-118h274v274H732v-74L418-336Z" />
                    </svg>
                  </h2>
                </Link>
                <p className="flex flex-row-reverse gap-2.5 items-center flex-wrap">
                  {project.tools.map((tool) => (
                  <svg key={tool} xmlns="http://www.w3.org/2000/svg" height={24} width={24} viewBox="0 -960 960 960" fill="currentColor">
                      <path d={iconPath(tool)} />
                    </svg>
                  ))}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </Layout>
  );
}
