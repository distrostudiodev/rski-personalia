import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Badge,
  Box,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  RiArchiveStackFill,
  RiAwardFill,
  RiCalendarCheckFill,
  RiCalendarCloseFill,
  RiCalendarFill,
  RiCalendarScheduleFill,
  RiCircleFill,
  RiCloseCircleFill,
  RiFileChartFill,
  RiGraduationCapFill,
  RiHeartFill,
  RiLoginBoxFill,
  RiUserStarFill,
} from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import {
  useLightDarkColor,
  useWarningAlphaColor,
  useWarningColor,
} from "../../constant/colors";
import dataKaryawanLabel from "../../constant/dataKaryawanLabel";
import { responsiveSpacing } from "../../constant/sizes";
import useAuth from "../../global/useAuth";
import useBackOnClose from "../../hooks/useBackOnClose";
import useDataState from "../../hooks/useDataState";
import backOnClose from "../../lib/backOnClose";
import calculateMasaKerjaFromTanggalMasuk from "../../lib/calculateMasaKerjaFromTanggalMasuk";
import formatDate from "../../lib/formatDate";
import formatDurationShort from "../../lib/formatDurationShort";
import formatNumber from "../../lib/formatNumber";
import isHasPermissions from "../../lib/isHasPermissions";
import FlexLine from "../independent/FlexLine";
import NoData from "../independent/NoData";
import Skeleton from "../independent/Skeleton";
import CContainer from "../wrapper/CContainer";
import PermissionTooltip from "../wrapper/PermissionTooltip";
import AktifkanNonaktifkanButton from "./AktifkanNonaktifkanButton";
import DetailAktivitasKaryawanModalDisclosure from "./DetailAktivitasKaryawanModalDisclosure";
import DetailCutiKaryawanModalDisclosure from "./DetailCutiKaryawanModalDisclosure";
import DetailDiklatKaryawanModalDisclosure from "./DetailDiklatKaryawanModalDisclosure";
import DokumenKaryawanModalDisclosure from "./DetailDokumenKaryawanModalDisclosure";
import DetailJadwalKaryawanModalDisclosure from "./DetailJadwalKaryawanModalDisclosure";
import DetailKeluargaKaryawanModalDisclosure from "./DetailKeluargaKaryawanModalDisclosure";
import DetailLemburKaryawanModalDisclosure from "./DetailLemburKaryawanModalDisclosure";
import DetailRekamJejakKaryawanModalDisclosure from "./DetailRekamJejakKaryawanModalDisclosure";
import DetailTukarJadwalKaryawanModalDisclosure from "./DetailTukarJadwalKaryawanModalDisclosure";
import DisclosureHeader from "./DisclosureHeader";
import EditKaryawanModal from "./EditKaryawanModal";
import SearchComponent from "./input/SearchComponent";
import Retry from "./Retry";
import SmallLink from "./SmallLink";
import StatusAktifBadge from "./StatusAktifBadge";
import StatusKaryawanBadge from "./StatusKaryawanBadge";
import DetailPenilaianKaryawanModalDisclosure from "./DetailPenilaianKaryawanModalDisclosure";

interface Props {
  id?: string;
  user_id?: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
export default function DetailKaryawanModal({
  id,
  user_id,
  isOpen,
  onOpen,
  onClose,
}: Props) {
  // SX
  const lightDarkColor = useLightDarkColor();
  const warningColor = useWarningColor();
  const warningAlphaColor = useWarningAlphaColor();

  useBackOnClose(
    id || `detail-karyawan-modal-${user_id}`,
    isOpen,
    onOpen,
    onClose
  );

  const initialRef = useRef(null);

  // const loading = true;

  const { error, notFound, loading, data, retry } = useDataState<any>({
    initialData: undefined,
    url: `/api/rski/dashboard/karyawan/detail-karyawan-user/${user_id}`,
    dependencies: [isOpen, user_id],
    conditions: !!(isOpen && user_id),
  });
  const [search, setSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string[]>([]);

  useEffect(() => {
    const words = search?.split(" ")?.filter((word) => word.length > 0);
    const modifiedWords = words?.reduce((acc: string[], word) => {
      acc.push(word);
      if (word.toLowerCase() === "nomor") {
        acc.push("no.");
      } else if (word.toLowerCase() === "nik") {
        acc.push("no. induk karyawan");
      }
      return acc;
    }, []);
    setSearchQuery(modifiedWords);
  }, [search]);

  const [emptyDataLabel, setEmptyDataLabel] = useState<any>(undefined);
  function countEmptyValues(obj: Record<string, any>): any[] {
    const allowedNullKeys = [
      "masa_berlaku_str",
      "masa_berlaku_sip",
      "gelar_depan",
      "masa_kerja",
      "tunjangan_jabatan",
      "tgl_keluar",
      "tgl_diangkat",
    ];
    let emptyDataLabels: any[] = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (
          !allowedNullKeys.includes(key) &&
          (value === null ||
            value === undefined ||
            value === "" ||
            value?.length === 0)
        ) {
          emptyDataLabels.push(key);
        }
      }
    }

    return emptyDataLabels;
  }

  useEffect(() => {
    setEmptyDataLabel(undefined);
    if (data) {
      setEmptyDataLabel(countEmptyValues(data));
    }
  }, [data]);

  const { userPermissions } = useAuth();
  const editPermission = isHasPermissions(userPermissions, [49]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={backOnClose}
      initialFocusRef={initialRef}
      size={"full"}
      scrollBehavior={"inside"}
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent borderRadius={12} minH={"calc(100vh - 32px)"}>
        <ModalHeader ref={initialRef}>
          <DisclosureHeader title={"Detail Karyawan"} />
        </ModalHeader>
        <ModalBody px={0}>
          {error && (
            <>
              {notFound && <NoData />}

              {!notFound && (
                <Box my={"auto"}>
                  <Retry loading={loading} retry={retry} />
                </Box>
              )}
            </>
          )}

          {!error && (
            <>
              {loading && (
                <CContainer
                  h={"calc(100vh - 70px)"}
                  overflowY={"auto"}
                  className="scrollY"
                >
                  <SimpleGrid
                    columns={[1, null, null, 2]}
                    flex={1}
                    overflowY={"auto"}
                    className="scrollY"
                    mb={responsiveSpacing}
                  >
                    <CContainer
                      overflowY={[null, null, null, "auto"]}
                      className="scrollY"
                      bg={lightDarkColor}
                      px={responsiveSpacing}
                      justify={"space-between"}
                    >
                      <VStack gap={3} borderRadius={12} align={"center"} mb={4}>
                        <Skeleton
                          borderRadius={"full"}
                          w={"200px"}
                          h={"200px"}
                          mx={"auto"}
                        />
                        <Skeleton maxW={"400px"} />
                        <HStack w={"100%"} maxW={"400px"}>
                          <Skeleton w={"100%"} maxW={"400px"} h={"30px"} />
                          <Skeleton w={"100%"} maxW={"100px"} h={"30px"} />
                          <Skeleton w={"100%"} maxW={"100px"} h={"30px"} />
                        </HStack>
                      </VStack>

                      <Skeleton h={"95px"} mb={3} mt={"auto"} />

                      <SimpleGrid gap={3} columns={[1, 2, null, 3]}>
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                        <Skeleton h={"95px"} />
                      </SimpleGrid>
                    </CContainer>

                    <CContainer
                      overflowY={[null, null, null, "auto"]}
                      className="scrollY"
                      bg={lightDarkColor}
                      px={responsiveSpacing}
                      justify={"space-between"}
                      gap={3}
                    >
                      <HStack>
                        <Skeleton h={"40px"} />
                        <Skeleton h={"40px"} maxW={"140px"} />
                        <Skeleton h={"40px"} maxW={"100px"} />
                      </HStack>

                      <Skeleton flexShrink={0} h={"50px"} />

                      <Skeleton flexShrink={0} h={"400px"} />
                      <Skeleton flexShrink={0} h={"400px"} />
                      <Skeleton flexShrink={0} h={"400px"} />
                    </CContainer>
                  </SimpleGrid>
                </CContainer>
              )}

              {!loading && (
                <>
                  {data && (
                    <CContainer
                      h={"calc(100vh - 70px)"}
                      overflowY={"auto"}
                      className="scrollY"
                    >
                      <SimpleGrid
                        columns={[1, null, null, 2]}
                        flex={1}
                        overflowY={"auto"}
                        className="scrollY"
                        mb={responsiveSpacing}
                      >
                        <CContainer
                          overflowY={[null, null, null, "auto"]}
                          className="scrollY"
                          bg={lightDarkColor}
                          px={responsiveSpacing}
                          justify={"space-between"}
                        >
                          <VStack
                            gap={responsiveSpacing}
                            borderRadius={12}
                            align={"center"}
                            mb={3}
                          >
                            <Avatar
                              w={"200px"}
                              h={"200px"}
                              size={"xxl"}
                              fontSize={"64px !important"}
                              src={data.user?.foto_profil}
                              name={data.user?.nama}
                            />

                            <VStack gap={1} w={"100%"}>
                              <Text
                                fontWeight={700}
                                fontSize={32}
                                lineHeight={1.3}
                                textAlign={"center"}
                                mb={4}
                              >
                                {`${data?.gelar_depan || ""} ${
                                  data.user?.nama
                                } ${data?.gelar_belakang || ""}`}
                              </Text>

                              {/* Stats Basic */}
                              <HStack mb={6}>
                                <Text fontSize={20}>{data.nik}</Text>
                                <Icon
                                  as={RiCircleFill}
                                  fontSize={8}
                                  opacity={0.2}
                                />
                                <StatusAktifBadge
                                  data={data.user?.status_aktif}
                                />
                                <Icon
                                  as={RiCircleFill}
                                  fontSize={8}
                                  opacity={0.2}
                                />
                                <Badge
                                  borderRadius={"full"}
                                  paddingRight={2}
                                  colorScheme={
                                    data?.status_reward_presensi
                                      ? "green"
                                      : "red"
                                  }
                                >
                                  <HStack>
                                    <Text fontSize={12}>Reward presensi</Text>
                                    <Icon
                                      as={
                                        data?.status_reward_presensi
                                          ? RiAwardFill
                                          : RiCloseCircleFill
                                      }
                                      color={
                                        data?.status_reward_presensi
                                          ? "green.400"
                                          : "red.400"
                                      }
                                      fontSize={14}
                                    />
                                  </HStack>
                                </Badge>
                              </HStack>
                            </VStack>
                          </VStack>

                          {/* Stats Diklat */}
                          <HStack
                            mt={"auto"}
                            bg={"var(--divider)"}
                            p={4}
                            borderRadius={12}
                            w={"100%"}
                            gap={4}
                            align={"stretch"}
                            mb={3}
                          >
                            <VStack flex={1}>
                              <Text
                                textAlign={"center"}
                                fontSize={24}
                                fontWeight={500}
                              >
                                {formatDurationShort(
                                  data?.total_durasi_internal +
                                    data?.total_durasi_internal
                                ) || 0}
                              </Text>
                              <Text textAlign={"center"} opacity={0.4}>
                                Total Diklat
                              </Text>
                            </VStack>

                            <Box
                              w={"1px"}
                              flexShrink={0}
                              bg={"var(--divider3)"}
                            />

                            <VStack flex={1}>
                              <Text
                                textAlign={"center"}
                                fontSize={24}
                                fontWeight={500}
                              >
                                {formatDurationShort(
                                  data?.total_durasi_internal
                                ) || 0}
                              </Text>
                              <Text textAlign={"center"} opacity={0.4}>
                                Diklat Internal
                              </Text>
                            </VStack>

                            <VStack flex={1}>
                              <Text
                                textAlign={"center"}
                                fontSize={24}
                                fontWeight={500}
                              >
                                {formatDurationShort(
                                  data?.total_durasi_eksternal
                                ) || 0}
                              </Text>
                              <Text textAlign={"center"} opacity={0.4}>
                                Diklat Eksternal
                              </Text>
                            </VStack>
                          </HStack>

                          {/* Profil Menu */}
                          <SimpleGrid gap={3} columns={[1, 2, null, 3]}>
                            {/* Presensi */}
                            <DetailAktivitasKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flex={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                  as={RiLoginBoxFill}
                                  fontSize={32}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Aktivitas
                                </Text>
                              </VStack>
                            </DetailAktivitasKaryawanModalDisclosure>

                            {/* Jadwal */}
                            <DetailJadwalKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiCalendarFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Jadwal Aktif
                                </Text>
                              </VStack>
                            </DetailJadwalKaryawanModalDisclosure>

                            {/* Rekam Jejak */}
                            <DetailRekamJejakKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                h={"100%"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiFileChartFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Rekam Jejak
                                </Text>
                              </VStack>
                            </DetailRekamJejakKaryawanModalDisclosure>

                            {/* Data Keluarga */}
                            <DetailKeluargaKaryawanModalDisclosure
                              karyawan_id={data?.user?.data_karyawan_id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                h={"100%"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiHeartFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Data Keluarga
                                </Text>
                              </VStack>
                            </DetailKeluargaKaryawanModalDisclosure>

                            {/* Dokumen */}
                            <DokumenKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiArchiveStackFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Dokumen
                                </Text>
                              </VStack>
                            </DokumenKaryawanModalDisclosure>

                            {/* Cuti */}
                            <DetailCutiKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiCalendarCloseFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Cuti
                                </Text>
                              </VStack>
                            </DetailCutiKaryawanModalDisclosure>

                            {/* Tukar Jadwal */}
                            <DetailTukarJadwalKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiCalendarCheckFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Tukar Jadwal
                                </Text>
                              </VStack>
                            </DetailTukarJadwalKaryawanModalDisclosure>

                            {/* Lembur */}
                            <DetailLemburKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiCalendarScheduleFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Lembur
                                </Text>
                              </VStack>
                            </DetailLemburKaryawanModalDisclosure>

                            {/* Penilaian */}
                            <DetailPenilaianKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiUserStarFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Penilaian
                                </Text>
                              </VStack>
                            </DetailPenilaianKaryawanModalDisclosure>

                            {/* Diklat */}
                            <DetailDiklatKaryawanModalDisclosure
                              karyawan_id={data.id}
                              flexShrink={0}
                              role="group"
                            >
                              <VStack
                                cursor={"pointer"}
                                borderRadius={12}
                                justify={"center"}
                                p={4}
                                className="btn-solid clicky"
                              >
                                <Icon
                                  opacity={0.4}
                                  as={RiGraduationCapFill}
                                  fontSize={32}
                                  transition={"200ms"}
                                  _groupHover={{ opacity: 1 }}
                                />
                                <Text
                                  fontWeight={500}
                                  textAlign={"center"}
                                  lineHeight={1.4}
                                >
                                  Diklat
                                </Text>
                              </VStack>
                            </DetailDiklatKaryawanModalDisclosure>
                          </SimpleGrid>
                        </CContainer>

                        <CContainer
                          mt={[5, null, null, 0]}
                          gap={responsiveSpacing}
                          overflowY={[null, null, null, "auto"]}
                          className="scrollY"
                        >
                          <HStack
                            px={[0, null, 5]}
                            position={"sticky"}
                            top={"0"}
                            bg={lightDarkColor}
                            zIndex={2}
                          >
                            <SearchComponent
                              name="search"
                              onChangeSetter={(input) => {
                                setSearch(input);
                              }}
                              inputValue={search}
                              placeholder="data karyawan"
                              tooltipLabel="Cari data karyawan"
                            />

                            {/* Edit */}
                            <PermissionTooltip permission={editPermission}>
                              <AktifkanNonaktifkanButton
                                karyawan_id={data.id}
                                data={data?.user?.status_aktif}
                                isDisabled={!editPermission}
                              />
                            </PermissionTooltip>

                            <PermissionTooltip
                              permission={editPermission}
                              label={!editPermission && "Tidak ada akses"}
                            >
                              <Box>
                                <EditKaryawanModal
                                  initialData={data}
                                  isDisabled={!editPermission}
                                />
                              </Box>
                            </PermissionTooltip>
                          </HStack>

                          <CContainer
                            flex={1}
                            overflowY={"auto"}
                            className="scrollY"
                            bg={lightDarkColor}
                            gap={responsiveSpacing}
                            px={responsiveSpacing}
                          >
                            <>
                              {!emptyDataLabel && <Skeleton h={"50px"} />}

                              {emptyDataLabel && emptyDataLabel.length > 0 && (
                                <Accordion allowMultiple>
                                  <AccordionItem
                                    border={"none"}
                                    borderRadius={8}
                                    overflow={"clip"}
                                    bg={warningAlphaColor}
                                  >
                                    <AccordionButton
                                      w={"100%"}
                                      h={"50px"}
                                      gap={2}
                                      justifyContent={"space-between"}
                                      fontWeight={600}
                                      color={warningColor}
                                      _hover={{ bg: warningAlphaColor }}
                                      _expanded={{ bg: warningAlphaColor }}
                                    >
                                      <Text mt={"2px"}>
                                        {emptyDataLabel?.length === 0
                                          ? "Data karyawan lengkap"
                                          : `${emptyDataLabel?.length} data masih kosong`}
                                      </Text>
                                      <AccordionIcon />
                                    </AccordionButton>

                                    <AccordionPanel py={4}>
                                      <Wrap
                                        align={"center"}
                                        spacing={responsiveSpacing}
                                      >
                                        {emptyDataLabel?.map(
                                          (key: any, i: number) => (
                                            <HStack key={i}>
                                              <Icon
                                                as={RiCircleFill}
                                                opacity={0.2}
                                                fontSize={8}
                                              />
                                              <Text opacity={0.6}>
                                                {/* @ts-ignore */}
                                                {dataKaryawanLabel[key]}
                                              </Text>
                                            </HStack>
                                          )
                                        )}
                                      </Wrap>
                                    </AccordionPanel>
                                  </AccordionItem>
                                </Accordion>
                              )}
                            </>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Pribadi
                              </Text>

                              <VStack
                                align={"stretch"}
                                w={"100%"}
                                gap={4}
                                minH={"150px"}
                                // bg={"red"}
                              >
                                {/* <HStack justify={"space-between"}>
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Jenis Karyawan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <JenisKaryawanBadge
                                    data={d
                                    ata.unit_kerja?.jenis_karyawan}
                                    
                                  />
                                </HStack> */}

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Induk Karyawan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. Induk Karyawan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data?.nik}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>NIK KTP</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="NIK KTP"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data?.path_nik_ktp && (
                                      <SmallLink to={data?.path_nik_ktp}>
                                        Lihat
                                      </SmallLink>
                                    )}

                                    {data?.nik_ktp && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data?.nik_ktp}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. KK</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. KK"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data?.path_no_kk && (
                                      <SmallLink to={data?.path_no_kk}>
                                        Lihat
                                      </SmallLink>
                                    )}

                                    {data?.no_kk && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data?.no_kk}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tempat Lahir</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tempat Lahir"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.tempat_lahir}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tanggal Lahir</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tanggal Lahir"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {formatDate(data.tgl_lahir)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Jenis Kelamin</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Jenis Kelamin"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.jenis_kelamin === 1
                                      ? "Laki - laki"
                                      : data.jenis_kelamin === 0
                                      ? "Perempuan"
                                      : ""}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Agama</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Agama"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.agama?.label}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Alamat</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Alamat"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Tooltip label={data.alamat}>
                                    <Text
                                      fontWeight={500}
                                      whiteSpace={"nowrap"}
                                      overflow={"hidden"}
                                      textOverflow={"ellipsis"}
                                      maxW={"243px"}
                                    >
                                      {data.alamat}
                                    </Text>
                                  </Tooltip>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Telepon</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. Telepon"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.no_hp}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Email</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Email"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data?.email}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Gelar Depan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Gelar Depan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data?.gelar_depan}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Gelar Depan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Gelar Belakang"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data?.gelar_belakang}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Kesehatan
                              </Text>

                              <VStack align={"stretch"} gap={4}>
                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Rekam Medis</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. Rekam Medis"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.no_rm}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Manulife</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. Manulife"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.no_manulife}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. BPJS Kesehatan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. BPJS Kesehatan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data?.path_no_bpjsksh && (
                                      <SmallLink to={data?.path_no_bpjsksh}>
                                        Lihat
                                      </SmallLink>
                                    )}

                                    {data.no_bpjsksh && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data.no_bpjsksh}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. BPJS Ketenagakerjaan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. BPJS Ketenagakerjaan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  {data?.path_no_bpjsktk && (
                                    <SmallLink to={data?.path_no_bpjsktk}>
                                      Lihat
                                    </SmallLink>
                                  )}

                                  {data?.no_bpjsktk && (
                                    <Text fontWeight={500} textAlign={"right"}>
                                      {data.no_bpjsktk}
                                    </Text>
                                  )}
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tinggi Badan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tinggi Badan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  {data.tinggi_badan && (
                                    <Text fontWeight={500} textAlign={"right"}>
                                      {data.tinggi_badan} cm
                                    </Text>
                                  )}
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Berat Badan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Berat Badan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  {data?.berat_badan && (
                                    <Text fontWeight={500} textAlign={"right"}>
                                      {data.berat_badan} kg
                                    </Text>
                                  )}
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Golongan Darah</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Golongan Darah"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.golongan_darah?.label}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Pekerjaan
                              </Text>

                              <VStack align={"stretch"} gap={4}>
                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tanggal Masuk</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tanggal Masuk"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {formatDate(data.tgl_masuk)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tanggal Keluar</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tanggal Keluar"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {formatDate(data.tgl_keluar)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tanggal Diangkat</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tanggal Diangkat"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {formatDate(data.tgl_diangkat)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Masa Kerja</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Masa Kerja"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {calculateMasaKerjaFromTanggalMasuk(
                                      data.tgl_masuk
                                    )}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Unit Kerja</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Unit Kerja"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.unit_kerja?.nama_unit}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Jabatan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Jabatan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.jabatan?.nama_jabatan}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Jabatan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Role"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.role?.name}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Kompetensi</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Kompetensi"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.kompetensi?.nama_kompetensi}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Status Karyawan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Status Karyawan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <StatusKaryawanBadge
                                    data={data.status_karyawan}
                                  />
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tanggal Berakhir PKS</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tanggal Berakhir PKS"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {formatDate(data.tgl_berakhir_pks)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Masa Diklat</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Masa Diklat"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {formatDurationShort(data.masa_diklat)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Pendidikan dan Sertifikat
                              </Text>

                              <VStack align={"stretch"} gap={4}>
                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Ijazah</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Pendidikan Terakhir"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data.pendidikan_terakhir && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data?.pendidikan_terakhir}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Ijazah</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Asal Sekolah"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data.pendidikan_terakhir && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data?.asal_sekolah}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Ijazah</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. Ijazah"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data?.path_no_ijazah && (
                                      <SmallLink to={data?.path_no_ijazah}>
                                        Lihat
                                      </SmallLink>
                                    )}

                                    {data.no_ijazah && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data.no_ijazah}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Tahun Lulus</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tahun Lulus"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.tahun_lulus}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. STR</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. STR"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data?.path_no_str && (
                                      <SmallLink to="#">Lihat</SmallLink>
                                    )}

                                    {data.no_str && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data.no_str}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Masa Berlaku STR</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Masa Berlaku STR"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.masa_berlaku_str
                                      ? formatDate(data.masa_berlaku_str)
                                      : "Seumur Hidup"}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. SIP</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. SIP"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <HStack>
                                    {data?.path_no_sip && (
                                      <SmallLink to={data?.path_no_sip}>
                                        Lihat
                                      </SmallLink>
                                    )}

                                    {data.no_sip && (
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {data.no_sip}
                                      </Text>
                                    )}
                                  </HStack>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Masa Berlaku SIP</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Masa Berlaku SIP"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.masa_berlaku_sip
                                      ? formatDate(data.masa_berlaku_sip)
                                      : "Seumur Hidup"}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Keuangan
                              </Text>

                              <VStack align={"stretch"} gap={4}>
                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Kelompok Gaji</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Kelompok Gaji"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.kelompok_gaji?.nama_kelompok}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Gaji</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Gaji"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp{" "}
                                    {formatNumber(
                                      data.kelompok_gaji?.besaran_gaji || 0
                                    )}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>NPWP</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="NPWP"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.npwp}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>No. Rekening</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="No. Rekening"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.no_rekening}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Kode PTKP</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Kode PTKP"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    {data.ptkp?.kode_ptkp}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Uang Makan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Uang Makan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp {formatNumber(data.uang_makan || 0)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Uang Lembur</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Uang Lembur"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp {formatNumber(data.uang_lembur || 0)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Tunjangan
                              </Text>

                              <VStack align={"stretch"} gap={4}>
                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Jabatan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tunjangan Jabatan"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp{" "}
                                    {formatNumber(
                                      data.jabatan?.tunjangan_jabatan || 0
                                    )}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Jabatan</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tunjangan Kompetensi"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp{" "}
                                    {formatNumber(
                                      data.kompetensi?.tunjangan_kompetensi || 0
                                    )}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Fungsional</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tunjangan Fungsional"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp{" "}
                                    {formatNumber(
                                      data?.tunjangan_fungsional || 0
                                    )}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Khusus</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tunjangan Khusus"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp{" "}
                                    {formatNumber(data?.tunjangan_khusus || 0)}
                                  </Text>
                                </HStack>

                                <HStack justify={"space-between"}>
                                  {/* <Text opacity={0.6}>Lainnya</Text> */}
                                  <Box opacity={0.6}>
                                    <Highlighter
                                      highlightClassName="hw"
                                      unhighlightClassName="uw"
                                      searchWords={searchQuery}
                                      autoEscape={true}
                                      textToHighlight="Tunjangan Lainnya"
                                    />
                                  </Box>
                                  <FlexLine />
                                  <Text fontWeight={500} textAlign={"right"}>
                                    Rp{" "}
                                    {formatNumber(data?.tunjangan_lainnya || 0)}
                                  </Text>
                                </HStack>
                              </VStack>
                            </VStack>

                            <VStack align={"stretch"} gap={0}>
                              <Text fontSize={20} fontWeight={600} mb={4}>
                                Data Potongan
                              </Text>

                              <VStack align={"stretch"} gap={4}>
                                {data.potongan_gaji?.length === 0 && (
                                  <Text opacity={0.4}>
                                    Tidak ada potongan gaji
                                  </Text>
                                )}

                                {data.potongan_gaji?.map(
                                  (potongan: any, i: number) => (
                                    <HStack justify={"space-between"} key={i}>
                                      <Box opacity={0.6}>
                                        <Highlighter
                                          highlightClassName="hw"
                                          unhighlightClassName="uw"
                                          searchWords={searchQuery}
                                          autoEscape={true}
                                          textToHighlight={potongan.nama_premi}
                                        />
                                      </Box>
                                      <FlexLine />
                                      <Text
                                        fontWeight={500}
                                        textAlign={"right"}
                                      >
                                        {potongan.kategori_potongan_id === 1
                                          ? `${formatNumber(
                                              potongan.besaran_premi || 0
                                            )}%`
                                          : `Rp ${formatNumber(
                                              potongan.besaran_premi || 0
                                            )}`}
                                        {/* Rp{" "}
                                        {formatNumber(potongan.besaran_premi)} */}
                                      </Text>
                                    </HStack>
                                  )
                                )}
                              </VStack>
                            </VStack>
                          </CContainer>
                        </CContainer>
                      </SimpleGrid>
                    </CContainer>
                  )}
                </>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
