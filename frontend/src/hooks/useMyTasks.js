import { useCallback, useEffect, useState } from "react";
import api from "../services/axiosApi";
import { getErrorMessage } from "../utils/myTasksHelper";

export default function useMyTasks(activeFilter) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingTasks, setUpdatingTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [currTasks, setCurrTasks] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try{
      const params = {};
      if(activeFilter !== "All") {
        params.status = activeFilter;
      }

      const {data} = await api.get("/dashboard/my-tasks",{params});

      const taskList = activeFilter === "All" ? data.Alltasks : data.filteredTasks;

      setTasks(Array.isArray(taskList) ? taskList : []);
      setTotalTasks(data.Allcount ?? 0);
      setCurrTasks(data.currTasks ?? 0);
      setCompletedTasks(data.completedTasks ?? 0);
    }catch(error){
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateStatus = useCallback(
    async (taskId, newStatus) => {
      const originalTask = tasks.find(
        (task) => task._id === taskId
      );

      if (
        !originalTask ||
        originalTask.status === newStatus ||
        updatingTasks.includes(taskId)
      ) {
        return;
      }

      setUpdatingTasks((previous) => [...previous, taskId]);
      setPageError("");

      // Optimistic update.
      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );

      try {
        await api.patch(`/tasks/${taskId}/status`, {
          status: newStatus,
        });

        // Refresh counts and server-filtered results.
        await fetchTasks();
      } catch (error) {
        setTasks((previous) =>
          previous.map((task) =>
            task._id === taskId
              ? { ...task, status: originalTask.status }
              : task
          )
        );

        setPageError(getErrorMessage(error));
      } finally {
        setUpdatingTasks((previous) =>
          previous.filter((id) => id !== taskId)
        );
      }
    },
    [tasks, updatingTasks, fetchTasks]
  );

  const dismissError = useCallback(() => {
    setPageError("");
  }, []);

  return {
    tasks,
    loading,
    pageError,
    updatingTasks,
    totalTasks,
    completedTasks,
    currTasks,
    fetchTasks,
    updateStatus,
    dismissError,
  };
}