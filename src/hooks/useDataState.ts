import { useEffect, useState } from "react";
import req from "../constant/req";
import useRenderTrigger from "../global/useRenderTrigger";

interface Props<T> {
  initialData?: T;
  url?: string;
  payload?: any;
  limit?: number;
  dependencies?: any[];
  conditions?: boolean;
}

const useDataState = <T>({
  initialData,
  payload,
  url,
  limit,
  dependencies = [],
  conditions = true,
}: Props<T>) => {
  const [error, setError] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingLoadMore, setLoadingLoadMore] = useState<boolean>(false);
  const [data, setData] = useState<T | undefined>(initialData);
  const [offset, setOffset] = useState<number>(0);
  const { rt } = useRenderTrigger();

  useEffect(() => {
    setLoading(true);
    if (conditions && url) {
      makeRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditions, url, rt, ...dependencies]);

  const makeRequest = () => {
    const method = payload ? "POST" : "GET";
    const data = {
      ...payload,
      limit: limit,
      offset: offset,
    };

    req({
      method,
      url,
      data: method === "POST" ? data : undefined,
      // params: method === "GET" ? data : undefined,
    })
      .then((response) => {
        setError(false);
        if (response.status === 200) {
          setData(response.data.data);
        }
      })
      .catch((error) => {
        if (error.response.status === 404) {
          setNotFound(true);
        }
        setError(true);
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function retry() {
    setError(false);
    setLoading(true);
    makeRequest();
  }

  function loadMore() {
    setLoadingLoadMore(true);
    if (limit) {
      setOffset((ps) => ps + limit);
    }

    //TODO http request dan append ke data
  }

  return {
    data,
    setData,
    loading,
    setLoading,
    notFound,
    setNotFound,
    error,
    setError,
    retry,
    loadMore,
    loadingLoadMore,
    setLoadingLoadMore,
  };
};

export default useDataState;
