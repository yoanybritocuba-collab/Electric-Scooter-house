import { useState, useEffect } from "react";
import { getInfoLine, InfoLineData } from "@/services/infoLineService";

export const useInfoLine = () => {
  const [config, setConfig] = useState<InfoLineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInfoLine = async () => {
      try {
        const data = await getInfoLine();
        setConfig(data);
      } catch (error) {
        console.error("Error cargando línea informativa:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInfoLine();
  }, []);

  return { config, loading };
};