import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { AlertCircleIcon } from "lucide-react";
import FullPagePreview from "../components/FullPagePreview";
import { UseAppContext } from "../context/AppContext";

const Preview = () => {
  const { id } = useParams();

  const {
    activeProject,
    loadingActiveProject: loading,
    loadProject,
  } = UseAppContext();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  if (loading || !project) {
    return <Loading />;
  }

  return <FullPagePreview files={project.files} />;
};

export default Preview;
