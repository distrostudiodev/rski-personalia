import { HStack } from "@chakra-ui/react";
import { useState } from "react";
import { responsiveSpacing } from "../../constant/sizes";
import formatDate from "../../lib/formatDate";
import formatDuration from "../../lib/formatDuration";
import formatNumber from "../../lib/formatNumber";
import formatTime from "../../lib/formatTime";
import NotFound from "../independent/NotFound";
import CustomTableContainer from "../wrapper/CustomTableContainer";
import MultiSelectKategoriDiklat from "./_Select/MultiSelectKategoriDiklat";
import CustomTable from "./CustomTable";
import SearchComponent from "./input/SearchComponent";
import StatusVerifikasiBadge2 from "./StatusVerifikasiBadge2";
import TabelElipsisText from "./TabelElipsisText";

interface Props {
  data: any[];
}

export default function TabelDetailDiklatKaryawan({ data }: Props) {
  // Filter Config
  const [filterConfig, setFilterConfig] = useState<any>({
    search: "",
    kategori_diklat: undefined as any,
  });

  const fd = data.filter((item: any) => {
    const searchTerm = filterConfig.search.toLowerCase();

    const matchesSearchTerm1 = (item.kategori_potongan_id?.label)
      .toLowerCase()
      .includes(searchTerm);

    const matchesSearchTerm2 = formatDate(item.created_at)
      .toLowerCase()
      .includes(searchTerm);

    return matchesSearchTerm1 && matchesSearchTerm2;
  });

  const formattedHeader = [
    {
      th: "Status",
      isSortable: true,
    },
    {
      th: "Nama Diklat",
      isSortable: true,
    },
    {
      th: "Kuota",
      isSortable: true,
      cProps: {
        justify: "center",
      },
    },
    {
      th: "Tanggal Mulai",
      isSortable: true,
    },
    {
      th: "Tanggal Selesai",
      isSortable: true,
    },
    {
      th: "Jam Mulai",
      isSortable: true,
    },
    {
      th: "Jam Selesai",
      isSortable: true,
    },
    {
      th: "Durasi",
      isSortable: true,
    },
    {
      th: "Deskripsi",
      isSortable: true,
    },
  ];
  const formattedData = fd?.map((item: any) => ({
    id: item.id,
    columnsFormat: [
      {
        value: item.status_diklat_id.label,
        td: <StatusVerifikasiBadge2 data={item.status_diklat_id} w={"120px"} />,
      },
      {
        value: item.nama,
        td: item.nama,
      },
      {
        value: item.kuota,
        td: formatNumber(item.kuota),
        isNumeric: true,
        cProps: {
          justify: "center",
        },
      },
      {
        value: item.tgl_mulai,
        td: formatDate(item.tgl_mulai),
      },
      {
        value: item.tgl_selesai,
        td: formatDate(item.tgl_selesai),
      },
      {
        value: item.jam_mulai,
        td: formatTime(item.jam_mulai),
      },
      {
        value: item.jam_selesai,
        td: formatTime(item.jam_selesai),
      },
      {
        value: item.durasi,
        td: formatDuration(item.durasi),
      },
      {
        value: item.deskripsi,
        td: <TabelElipsisText data={item.deskripsi} />,
      },
    ],
  }));

  return (
    <>
      <HStack mb={responsiveSpacing}>
        <SearchComponent
          name="search"
          onChangeSetter={(input) => {
            setFilterConfig((ps: any) => ({
              ...ps,
              search: input,
            }));
          }}
          inputValue={filterConfig.search}
          placeholder="cari dengan tanggal jadwal"
          tooltipLabel="cari dengan tanggal jadwal (27 Agustus 2024)"
        />
        <MultiSelectKategoriDiklat
          name="kategori_diklat"
          onConfirm={(input) => {
            setFilterConfig(input);
          }}
          inputValue={filterConfig.kategori_diklat}
        />
      </HStack>

      {fd.length === 0 && <NotFound />}

      {fd.length > 0 && (
        <CustomTableContainer>
          <CustomTable
            formattedHeader={formattedHeader}
            formattedData={formattedData}
            // rowOptions={rowOptions}
          />
        </CustomTableContainer>
      )}
    </>
  );
}
