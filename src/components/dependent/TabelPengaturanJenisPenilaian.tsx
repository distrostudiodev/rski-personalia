import { Center, Icon, MenuItem, Text } from "@chakra-ui/react";
import { RiDeleteBinLine, RiEditLine, RiHistoryLine } from "@remixicon/react";
import { Interface__SelectOption } from "../../constant/interfaces";
import { iconSize } from "../../constant/sizes";
import useDataState from "../../hooks/useDataState";
import EditJenisPenilaianModalDisclosure from "../independent/EditJenisPenilaianModalDisclosure";
import NoData from "../independent/NoData";
import NotFound from "../independent/NotFound";
import Skeleton from "../independent/Skeleton";
import CustomTableContainer from "../wrapper/CustomTableContainer";
import CustomTable from "./CustomTable";
import DeleteDataPengaturanModalDisclosure from "./DeleteDataPengaturanModalDisclosure";
import RestoreDataPengaturanModalDisclosure from "./RestoreDataPengaturanModalDisclosure";
import Retry from "./Retry";
import StatusDihapus from "./StatusDihapus";
import StatusKaryawanBadge from "./StatusKaryawanBadge";

interface Props {
  filterConfig?: any;
}

export default function TabelPengaturanJenisPenilaian({ filterConfig }: Props) {
  // SX

  // Row Options Config
  const rowOptions = [
    (rowData: any) => {
      return (
        <EditJenisPenilaianModalDisclosure rowData={rowData}>
          <MenuItem>
            <Text>Edit</Text>
            <Icon as={RiEditLine} fontSize={iconSize} opacity={0.4} />
          </MenuItem>
        </EditJenisPenilaianModalDisclosure>
      );
    },
    (rowData: any) => {
      return (
        <RestoreDataPengaturanModalDisclosure
          id={rowData.id}
          url="/api/rski/dashboard/perusahaan/jenis-penilaian/restore"
        >
          <MenuItem isDisabled={!rowData.columnsFormat[1].value}>
            <Text>Restore</Text>
            <Icon as={RiHistoryLine} fontSize={iconSize} opacity={0.4} />
          </MenuItem>
        </RestoreDataPengaturanModalDisclosure>
      );
    },
    "divider",
    (rowData: any) => {
      return (
        <DeleteDataPengaturanModalDisclosure
          id={rowData.id}
          url="/api/rski/dashboard/perusahaan/jenis-penilaian"
        >
          <MenuItem
            fontWeight={500}
            isDisabled={rowData.columnsFormat[1].value}
          >
            <Text color={"red.400"}>Delete</Text>
            <Icon color={"red.400"} as={RiDeleteBinLine} fontSize={iconSize} />
          </MenuItem>
        </DeleteDataPengaturanModalDisclosure>
      );
    },
  ];

  const { error, loading, data, retry } = useDataState<any[]>({
    initialData: undefined,
    url: `/api/rski/dashboard/perusahaan/jenis-penilaian`,
    dependencies: [],
  });

  const fd = data?.filter((item: any) => {
    const searchTerm = filterConfig?.search.toLowerCase();
    const isDeletedTerm = filterConfig?.is_deleted?.map(
      (term: Interface__SelectOption) => term.value
    );

    const matchesSearchTerm = item.nama.toLowerCase().includes(searchTerm);
    const matchesIsDeletedTerm =
      isDeletedTerm?.includes(1) && isDeletedTerm?.includes(0)
        ? true
        : isDeletedTerm?.includes(1)
        ? !!item.deleted_at
        : isDeletedTerm?.includes(0)
        ? !item.deleted_at
        : true;

    return matchesSearchTerm && matchesIsDeletedTerm;
  });
  const formattedHeader = [
    {
      th: "Nama Cuti",
      isSortable: true,
      props: {
        position: "sticky",
        left: 0,
        zIndex: 3,
        w: "243px",
      },
      cProps: {
        borderRight: "1px solid var(--divider3)",
      },
    },
    {
      th: "Status Dihapus",
      isSortable: true,
      cProps: {
        justify: "center",
      },
    },
    {
      th: "Status Kepegawaian",
      isSortable: true,
      cProps: {
        justify: "center",
      },
    },
    {
      th: "Jabatan Penilai",
      isSortable: true,
    },
    {
      th: "Jabatan Dinilai",
      isSortable: true,
    },
  ];
  const formattedData = fd?.map((item: any) => ({
    id: item.id,
    columnsFormat: [
      {
        value: item.nama,
        td: item.nama,
        props: {
          position: "sticky",
          left: 0,
          zIndex: 2,
        },
        cProps: {
          borderRight: "1px solid var(--divider3)",
        },
      },
      {
        value: item.deleted_at,
        td: item.deleted_at ? <StatusDihapus data={item.deleted_at} /> : "",
        isDate: true,
        cProps: {
          justify: "center",
        },
      },
      {
        original_data: item.status_karyawan,
        value: item.status_karyawan?.id,
        td: <StatusKaryawanBadge data={item.status_karyawan} w={"120px"} />,
        isNumeric: true,
        cProps: {
          justify: "center",
        },
      },
      {
        original_data: item.jabatan_penilai,
        value: item.jabatan_penilai?.nama_jabatan,
        td: item.jabatan_penilai?.nama_jabatan,
        isNumeric: true,
      },
      {
        original_data: item.jabatan_dinilai,
        value: item.jabatan_dinilai?.nama_jabatan,
        td: item.jabatan_dinilai?.nama_jabatan,
        isNumeric: true,
      },
    ],
  }));

  return (
    <>
      {error && (
        <Center my={"auto"} minH={"300px"}>
          <Retry loading={loading} retry={retry} />
        </Center>
      )}

      {!error && (
        <>
          {loading && (
            <>
              <Skeleton minH={"300px"} flex={1} mx={"auto"} />
            </>
          )}
          {!loading && (
            <>
              {!formattedData && <NoData minH={"300px"} />}

              {formattedData && (
                <>
                  {fd && fd?.length === 0 && <NotFound minH={"300px"} />}

                  {fd && fd?.length > 0 && (
                    <>
                      <CustomTableContainer>
                        <CustomTable
                          formattedHeader={formattedHeader}
                          formattedData={formattedData}
                          rowOptions={rowOptions}
                        />
                      </CustomTableContainer>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}