import React, { useEffect } from "react";
import { UseAppContext } from "../context/AppContext";
import PromptInput from "../components/PromptInput";
import { homeTags } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ClockIcon, TrashIcon } from "lucide-react";
import moment from "moment";

const HomePage = () => {
  const {
    user,
    projects,
    loadingProjects,
    generatingProject,
    loadProjects,
    handleGenerate,
    handleDelete,
    logout,
  } = UseAppContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user, loadProjects]);

  return (
    <div className="h-screen overflow-y-scroll text-white font-sans bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat">
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">
            BuilderAI
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
          <span>{user?.userName || user?.name || "Guest"}</span>
          <button
            onClick={logout}
            className="py-1.5 px-3 border border-white/20 text-white hover:bg-white/10 text-xs rounded-md cursor-pointer bg-transparent"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 mt-8 xl:mt-28">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <div className="flex items-center gap-2 p-1.5 pr-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[13px] text-white/90">
            <span className="px-3 py-1 text-[11px] bg-indigo-700 rounded-full font-medium tracking-wider">
              PROMO
            </span>
            <span>Create your first project for free.</span>
          </div>

          <h1 className="text-center text-4xl md:text-6xl font-medium mt-4 max-w-2xl text-white">
            Let's build your app together.
          </h1>
          <p className="text-center text-sm md:text-base max-w-xl mt-4 text-white/65 leading-relaxed">
            Describe your idea and watch AI design, structure, and launch your
            website instantly. No code required.
          </p>

          <div className="w-full mt-6">
            <PromptInput
              onSubmit={handleGenerate}
              loading={generatingProjects}
              placeholder="Describe the website you want to create..."
              variant="glass"
              autoFocus
            />
          </div>

          <div className="masked-marquee w-full mt-4 max-w-2xl overflow-hidden py-1">
            <div className="animate-marquee gap-3">
              {homeTags.map((tag, i) => {
                return (
                  <button
                    key={i}
                    onClick={() => handleGenerate(tag)}
                    className="px-4 py-1.5 border rounded-full text-sm text-white bg-white/10 border-white/25 hover:bg-white/20 transition cursor-pointer shrink-0 font-medium"
                    disabled={generatingProjects}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {!loadingProjects && projects.length > 0 && (
            <div className="mt-12 w-full">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <p className="text-xs font-medium uppercase text-neutral-100 tracking-widest">
                  All Projects
                </p>
                <span className="text-xs text-zinc-200 font-normal">
                  {projects.length}{" "}
                  {projects.length === 1 ? "Project" : "Projects"}
                </span>
              </div>

              <div className="space-y-2 max-h-[80vh] overflow-y-auto  pr-1">
                {projects.map((p) => (
                  <div
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center justify-between group hover:border-white/20 hover:bg-white/20 backdrop-blur-md transition-all"
                    key={p._id}
                  >
                    <button
                      type="button"
                      className="flex-1 min-w-0 text-left pr-3"
                      onClick={() => navigate(`/builder/${p._id}`)}
                      aria-label={`Open ${p.name || "project"}`}
                    >
                      <p className="text-sm font-medium text-white truncate">
                        {p.name}
                      </p>

                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-zinc-200 flex items-center gap-1">
                          <ClockIcon size={10} />
                          {moment(p.updatedAt || p.createdAt).fromNow()}
                        </span>

                        <span className="text-xs text-white/60 font-medium">
                          {p.version}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-md text-zinc-200 hover:text-rose-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p._id);
                        }}
                        aria-label={`Delete ${p.name || "project"}`}
                      >
                        <TrashIcon size={14} />
                      </button>
                      <ArrowRightIcon
                        size={14}
                        className="text-zinc-200 group-hover:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
