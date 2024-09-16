import { Center } from "@chakra-ui/react";
import { useState } from "react";
import useAuth from "../../global/useAuth";
import useFilterKaryawan from "../../global/useFilterKaryawan";
import useDataState from "../../hooks/useDataState";
import formatDate from "../../lib/formatDate";
import formatDurationShort from "../../lib/formatDurationShort";
import formatTime from "../../lib/formatTime";
import isHasPermissions from "../../lib/isHasPermissions";
import isObjectEmpty from "../../lib/isObjectEmpty";
import NoData from "../independent/NoData";
import NotFound from "../independent/NotFound";
import Skeleton from "../independent/Skeleton";
import CustomTableContainer from "../wrapper/CustomTableContainer";
import PermissionTooltip from "../wrapper/PermissionTooltip";
import AvatarAndNameTableData from "./AvatarAndNameTableData";
import CustomTable from "./CustomTable";
import Retry from "./Retry";
import StatusVerifikasiBadge2 from "./StatusVerifikasiBadge2";
import TabelFooterConfig from "./TabelFooterConfig";
import VerifikasiModal from "./VerifikasiModal";

interface Props {
  filterConfig: any;
}

export default function TabelIzin({ filterConfig }: Props) {
  // Limit Config
  const [limitConfig, setLimitConfig] = useState<number>(10);
  // Pagination Config
  const [pageConfig, setPageConfig] = useState<number>(1);
  // Filter Config
  const { formattedFilterKaryawan } = useFilterKaryawan();

  const { error, loading, notFound, data, paginationData, retry } =
    useDataState<any[]>({
      initialData: undefined,
      url: `/api/rski/dashboard/jadwal-karyawan/get-perizinan?page=${pageConfig}`,
      payload: {
        ...formattedFilterKaryawan,
        ...(filterConfig?.status_cuti?.length > 0 && {
          status_cuti: filterConfig.status_cuti.map((sp: any) => sp.value),
        }),
        ...(filterConfig?.tipe_cuti?.length > 0 && {
          tipe_cuti: filterConfig.tipe_cuti.map((sp: any) => sp.value),
        }),
      },
      limit: limitConfig,
      dependencies: [
        limitConfig,
        pageConfig,
        filterConfig,
        formattedFilterKaryawan,
      ],
    });

  const { userPermissions } = useAuth();
  const verif1Permission = isHasPermissions(userPermissions, [6]);

  const formattedHeader = [
    {
      th: "Nama",
      isSortable: true,
      props: {
        position: "sticky",
        left: 0,
        zIndex: 99,
        w: "243px",
      },
      cProps: {
        borderRight: "1px solid var(--divider3)",
      },
    },
    {
      th: "Status Izin",
      isSortable: true,
      cProps: {
        justify: "center",
      },
    },
    {
      th: "Tanggal Izin",
      isSortable: true,
    },
    {
      th: "Waktu Izin",
      isSortable: true,
    },
    {
      th: "Durasi",
      isSortable: true,
      cProps: {
        justify: "center",
      },
    },
    {
      th: "Keterangan",
      isSortable: true,
    },
    {
      th: "Verif. 1",
      props: {
        position: "sticky",
        right: 0,
        zIndex: 4,
        w: "122px",
      },
      cProps: {
        justify: "center",
        borderLeft: "1px solid var(--divider3)",
        borderRight: "1px solid var(--divider3)",
        w: "122px",
      },
    },
  ];
  const formattedData = data?.map((item: any) => ({
    id: item.id,
    columnsFormat: [
      {
        value: item.user.nama,
        td: (
          <AvatarAndNameTableData
            detailKaryawanId={`detail-karyawan-modal-${item.id}-${item.user.id}`}
            data={{
              id: item.user.id,
              nama: item.user.nama,
              foto_profil: item.user.foto_profil,
            }}
          />
        ),
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
        value: item.status_izin,
        td: (
          <StatusVerifikasiBadge2
            data={item.status_izin}
            alasan={item?.alasan}
            w={"180px"}
          />
        ),
        cProps: {
          justify: "center",
        },
      },
      {
        value: item.tgl_izin,
        td: formatDate(item.tgl_izin),
        isData: true,
      },
      {
        value: item.waktu_izin,
        td: formatTime(item?.waktu_izin),
        isTime: true,
      },
      {
        value: item.durasi,
        td: formatDurationShort(item?.durasi),
        isDate: true,
        cProps: {
          justify: "center",
        },
      },
      {
        value: item.keterangan,
        td: item.keterangan,
      },
      {
        value: "",
        td: item?.status_izin?.id === 1 && (
          <PermissionTooltip permission={verif1Permission}>
            <VerifikasiModal
              aria-label={`perubahan-data-verif-1-button-${item.id}"`}
              id={`verifikasi-perubahan-data-modal-${item.id}`}
              submitUrl={`api/rski/dashboard/jadwal-karyawan/izin/${item.id}/verifikasi-perizinan `}
              approvePayloadKey="verifikasi_pertama_disetujui"
              disapprovePayloadKey="verifikasi_pertama_ditolak"
              isDisabled={!verif1Permission}
            />
          </PermissionTooltip>
        ),
        props: {
          position: "sticky",
          right: 0,
          zIndex: 2,
        },
        cProps: {
          justify: "center",
          borderLeft: "1px solid var(--divider3)",
        },
      },
    ],
  }));

  return (
    <>
      {error && (
        <>
          {notFound && isObjectEmpty(formattedFilterKaryawan) && (
            <NoData minH={"300px"} />
          )}

          {notFound && !isObjectEmpty(formattedFilterKaryawan) && (
            <NotFound minH={"300px"} />
          )}

          {!notFound && (
            <Center my={"auto"} minH={"300px"}>
              <Retry loading={loading} retry={retry} />
            </Center>
          )}
        </>
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
                  <CustomTableContainer>
                    <CustomTable
                      formattedHeader={formattedHeader}
                      formattedData={formattedData}
                    />
                  </CustomTableContainer>
                </>
              )}
            </>
          )}
        </>
      )}

      <TabelFooterConfig
        limitConfig={limitConfig}
        setLimitConfig={setLimitConfig}
        pageConfig={pageConfig}
        setPageConfig={setPageConfig}
        paginationData={paginationData}
      />
    </>
  );
}