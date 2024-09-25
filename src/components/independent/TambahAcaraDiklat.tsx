import {
  Button,
  ButtonProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { RiUser2Fill } from "@remixicon/react";
import { useFormik } from "formik";
import { useRef, useState } from "react";
import * as yup from "yup";
import { iconSize } from "../../constant/sizes";
import useBackOnClose from "../../hooks/useBackOnClose";
import backOnClose from "../../lib/backOnClose";
import SelectKategoriDiklat from "../dependent/_Select/SelectKategoriDiklat";
import DisclosureHeader from "../dependent/DisclosureHeader";
import DateRangePickerModal from "../dependent/input/DateRangePickerModal";
import FileInputLarge from "../dependent/input/FileInputLarge";
import NumberInput from "../dependent/input/NumberInput";
import Textarea from "../dependent/input/Textarea";
import TimePickerModal from "../dependent/input/TimePickerModal";
import RequiredForm from "../form/RequiredForm";
import CContainer from "../wrapper/CContainer";
import req from "../../lib/req";
import useRenderTrigger from "../../hooks/useRenderTrigger";
import formatDate from "../../lib/formatDate";

interface Props extends ButtonProps {}

export default function TambahAcaraDiklat({ ...props }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useBackOnClose("tambah-acara-diklat-modal", isOpen, onOpen, onClose);
  const initialRef = useRef(null);

  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { rt, setRt } = useRenderTrigger();

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      gambar: "",
      nama: "",
      kategori: {
        value: 1,
        label: "Internal",
      },
      deskripsi: "",
      kuota: undefined as any,
      lokasi: "",
      tgl_mulai: undefined as any,
      tgl_selesai: undefined as any,
      jam_mulai: undefined as any,
      jam_selesai: undefined as any,
    },
    validationSchema: yup.object().shape({
      gambar: yup.string().required("Harus diisi"),
      nama: yup.string().required("Harus diisi"),
      kategori: yup.object().required("Harus diisi"),
      deskripsi: yup.string().required("Harus diisi"),
      kuota: yup.number().required("Harus diisi"),
      lokasi: yup.string().required("Harus diisi"),
      tgl_mulai: yup.string().required("Harus diisi"),
      tgl_selesai: yup.string().required("Harus diisi"),
      jam_mulai: yup.string().required("Harus diisi"),
      jam_selesai: yup.string().required("Harus diisi"),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = new FormData();
      payload.append("dokumen", values.gambar);
      payload.append("nama", values.nama);
      payload.append("deskripsi", values.deskripsi);
      payload.append("kuota", values.kuota);
      payload.append("tgl_mulai", formatDate(values.tgl_mulai, "short"));
      payload.append("tgl_selesai", formatDate(values.tgl_selesai, "short"));
      payload.append("jam_mulai", values.jam_mulai);
      payload.append("jam_selesai", values.jam_selesai);
      payload.append("lokasi", values.lokasi);
      payload.append("lokasi", values.lokasi);

      setLoading(true);
      req
        .post(`/api/rski/dashboard/perusahaan/diklat`, payload)
        .then((r) => {
          if (r.status === 201) {
            toast({
              status: "success",
              title: r.data.message,
              isClosable: true,
              position: "bottom-right",
            });
            setRt(!rt);
            resetForm();
          }
        })
        .catch((e) => {
          console.log(e);
          toast({
            status: "error",
            title:
              (typeof e?.response?.data?.message === "string" &&
                (e?.response?.data?.message as string)) ||
              "Maaf terjadi kesalahan pada sistem",
            isClosable: true,
            position: "bottom-right",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
  });

  return (
    <>
      <Button
        className="btn-ap clicky"
        colorScheme="ap"
        onClick={onOpen}
        leftIcon={<Icon as={RiUser2Fill} fontSize={iconSize} />}
        pl={5}
        {...props}
      >
        Buat Acara Diklat
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          formik.resetForm();
          backOnClose();
        }}
        initialFocusRef={initialRef}
        scrollBehavior="inside"
        size={"full"}
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent minH={"calc(100vh - 32px)"} borderRadius={12}>
          <ModalHeader ref={initialRef}>
            <DisclosureHeader
              title="Buat Acara Diklat"
              onClose={() => {
                formik.resetForm();
              }}
            />
          </ModalHeader>
          <ModalBody className="scrollY">
            <form id="tambahAcaraDiklatForm" onSubmit={formik.handleSubmit}>
              <SimpleGrid columns={[1, 2]} spacingX={4} mb={8}>
                <FormControl
                  flex={"1 1"}
                  mb={4}
                  isInvalid={!!formik.errors.gambar}
                >
                  <FormLabel>
                    Gambar Thumbnail
                    <RequiredForm />
                  </FormLabel>
                  <FileInputLarge
                    name="gambar"
                    onChangeSetter={(input) => {
                      formik.setFieldValue("gambar", input);
                    }}
                    inputValue={formik.values.gambar}
                    cProps={{ h: "100%" }}
                  />
                  <FormErrorMessage>
                    {formik.errors.gambar as string}
                  </FormErrorMessage>
                </FormControl>

                <CContainer flex={"1 1"} gap={4}>
                  <FormControl mb={4} isInvalid={!!formik.errors.nama}>
                    <FormLabel>
                      Nama Diklat
                      <RequiredForm />
                    </FormLabel>
                    <Input
                      name="nama"
                      placeholder="Pendidikan & Latihan"
                      onChange={formik.handleChange}
                      value={formik.values.nama}
                    />
                    <FormErrorMessage>
                      {formik.errors.nama as string}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl mb={4} isInvalid={!!formik.errors.kategori}>
                    <FormLabel>
                      Kategori
                      <RequiredForm />
                    </FormLabel>
                    <SelectKategoriDiklat
                      name="kategori"
                      onConfirm={(input) => {
                        formik.setFieldValue("kategori", input);
                      }}
                      inputValue={formik.values.kategori}
                      isError={!!formik.errors.kategori}
                      isDisabled
                    />
                    <FormErrorMessage>
                      {formik.errors.kategori as string}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl mb={4} isInvalid={!!formik.errors.deskripsi}>
                    <FormLabel>
                      Deskripsi
                      <RequiredForm />
                    </FormLabel>
                    <Textarea
                      name="deskripsi"
                      onChangeSetter={(input) => {
                        formik.setFieldValue("deskripsi", input);
                      }}
                      inputValue={formik.values.deskripsi}
                      minH={"100%"}
                    />
                    <FormErrorMessage>
                      {formik.errors.deskripsi as string}
                    </FormErrorMessage>
                  </FormControl>
                </CContainer>
              </SimpleGrid>

              <SimpleGrid columns={[1, 2, 3]} spacingX={4}>
                <FormControl mb={4} isInvalid={!!formik.errors.kuota}>
                  <FormLabel>
                    Kuota Peserta
                    <RequiredForm />
                  </FormLabel>
                  <NumberInput
                    name="kuota"
                    onChangeSetter={(input) => {
                      formik.setFieldValue("kuota", input);
                    }}
                    inputValue={formik.values.kuota}
                  />
                  <FormErrorMessage>
                    {formik.errors.kuota as string}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  mb={4}
                  isInvalid={
                    !!(formik.errors.tgl_mulai && formik.errors.tgl_selesai)
                  }
                >
                  <FormLabel>
                    Rentang Tanggal
                    <RequiredForm />
                  </FormLabel>
                  <DateRangePickerModal
                    id="date-range-tambah-diklat"
                    name="range_tgl"
                    onConfirm={(input) => {
                      if (input) {
                        formik.setFieldValue("tgl_mulai", input.from);
                        formik.setFieldValue("tgl_selesai", input.to);
                      }
                    }}
                    inputValue={
                      formik.values.tgl_mulai && formik.values.tgl_selesai
                        ? {
                            from: formik.values.tgl_mulai,
                            to: formik.values.tgl_selesai,
                          }
                        : undefined
                    }
                    isError={
                      !!(formik.errors.tgl_mulai || formik.errors.tgl_selesai)
                    }
                  />
                  <FormErrorMessage>
                    {
                      (formik.errors.tgl_mulai ||
                        formik.errors.tgl_selesai) as string
                    }
                  </FormErrorMessage>
                </FormControl>

                <FormControl mb={4} isInvalid={!!formik.errors.lokasi}>
                  <FormLabel>
                    Lokasi
                    <RequiredForm />
                  </FormLabel>
                  <Input
                    name="lokasi"
                    placeholder="Gedung Serba Guna"
                    onChange={formik.handleChange}
                    value={formik.values.lokasi}
                  />
                  <FormErrorMessage>
                    {formik.errors.lokasi as string}
                  </FormErrorMessage>
                </FormControl>

                <FormControl mb={4} isInvalid={!!formik.errors.jam_mulai}>
                  <FormLabel>
                    Jam Mulai
                    <RequiredForm />
                  </FormLabel>

                  <TimePickerModal
                    id="tambah-acara-diklat"
                    name="jam_mulai"
                    onConfirm={(input) => {
                      formik.setFieldValue("jam_mulai", input);
                    }}
                    inputValue={formik.values.jam_mulai}
                    isError={!!formik.errors.jam_mulai}
                  />
                  <FormErrorMessage>
                    {formik.errors.jam_mulai as string}
                  </FormErrorMessage>
                </FormControl>

                <FormControl mb={4} isInvalid={!!formik.errors.jam_selesai}>
                  <FormLabel>
                    Jam Selesai
                    <RequiredForm />
                  </FormLabel>

                  <TimePickerModal
                    id="tambah-acara-diklat"
                    name="jam_selesai"
                    onConfirm={(input) => {
                      formik.setFieldValue("jam_selesai", input);
                    }}
                    inputValue={formik.values.jam_selesai}
                    isError={!!formik.errors.jam_selesai}
                  />
                  <FormErrorMessage>
                    {formik.errors.jam_selesai as string}
                  </FormErrorMessage>
                </FormControl>
              </SimpleGrid>
            </form>

            <CContainer mt={"auto"}>
              <Button
                mt={4}
                mb={6}
                type="submit"
                form="tambahAcaraDiklatForm"
                className="btn-ap clicky"
                colorScheme="ap"
                w={"100%"}
                flexShrink={0}
                isLoading={loading}
              >
                Buat Acara Diklat
              </Button>
            </CContainer>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
