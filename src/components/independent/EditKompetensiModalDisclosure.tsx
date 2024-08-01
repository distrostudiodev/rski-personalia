import {
  Box,
  BoxProps,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { ReactNode, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import req from "../../constant/req";
import useRenderTrigger from "../../global/useRenderTrigger";
import useBackOnClose from "../../hooks/useBackOnClose";
import backOnClose from "../../lib/backOnClose";
import SelectJenisKompetensi from "../dependent/_Select/SelectJenisKompetensi";
import DisclosureHeader from "../dependent/DisclosureHeader";
import StringInput from "../dependent/input/StringInput";
import RequiredForm from "../form/RequiredForm";
import NumberInput from "../dependent/input/NumberInput";

interface Props extends BoxProps {
  rowData: any;
  children?: ReactNode;
}

export default function EditKompetensiModalDisclosure({
  rowData,
  children,
  ...props
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useBackOnClose(
    `edit-kompetensi-modal-${rowData.id}`,
    isOpen,
    onOpen,
    onClose
  );
  const initialRef = useRef(null);

  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { rt, setRt } = useRenderTrigger();

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      nama_kompetensi: rowData.columnsFormat[0]?.value,
      jenis_kompetensi: {
        value: rowData.columnsFormat[2]?.value,
        label: rowData.columnsFormat[2]?.value ? "Medis" : "Non-Medis",
      },
      total_tunjangan: rowData.columnsFormat[3]?.value,
      nilai_bor: rowData.columnsFormat[4]?.value,
    },
    validationSchema: yup.object().shape({
      nama_kompetensi: yup.string().required("Harus diisi"),
      jenis_kompetensi: yup.object().required("Harus diisi"),
      total_tunjangan: yup.number().required("Harus diisi"),
      nilai_bor: yup.number().required("Harus diisi"),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = {
        nama_kompetensi: values.nama_kompetensi,
        jenis_kompetensi: values.jenis_kompetensi.value,
        total_tunjangan: values.total_tunjangan,
        nilai_bor: values.nilai_bor,
        _method: "patch",
      };
      console.log(payload);
      setLoading(true);
      req
        .post(
          `/api/rski/dashboard/pengaturan/kompetensi/${rowData.id}`,
          payload
        )
        .then((r) => {
          if (r.status === 200) {
            toast({
              status: "success",
              title: r.data.message,
              isClosable: true,
              position: "bottom-right",
            });
            backOnClose();
            setRt(!rt);
          }
        })
        .catch((e) => {
          console.log(e);
          toast({
            status: "error",
            title: "Maaf terjadi kesalahan pada sistem",
            isClosable: true,
            position: "bottom-right",
          });
          setRt(!rt);
        })
        .finally(() => {
          setLoading(false);
        });
    },
  });

  const formikRef = useRef(formik);

  useEffect(() => {
    formikRef.current.setFieldValue(
      "nama_kompetensi",
      rowData.columnsFormat[0].value
    );
    formikRef.current.setFieldValue("jenis_kompetensi", {
      value: rowData.columnsFormat[2].value,
      label: rowData.columnsFormat[2].value ? "Medis" : "Non-Medis",
    });
    formikRef.current.setFieldValue(
      "total_tunjangan",
      rowData.columnsFormat[3].value
    );
    formikRef.current.setFieldValue(
      "nilai_bor",
      rowData.columnsFormat[4].value
    );
  }, [rowData]);

  return (
    <>
      <Box onClick={onOpen} {...props}>
        {children}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          backOnClose();
          formik.resetForm();
        }}
        initialFocusRef={initialRef}
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader ref={initialRef}>
            <DisclosureHeader
              title="Edit Kompetensi"
              onClose={() => {
                formik.resetForm();
              }}
            />
          </ModalHeader>
          <ModalBody>
            <form id="editUnitKerjaForm" onSubmit={formik.handleSubmit}>
              <FormControl
                mb={4}
                isInvalid={formik.errors.nama_kompetensi ? true : false}
              >
                <FormLabel>
                  Nama Kompetensi
                  <RequiredForm />
                </FormLabel>
                <StringInput
                  name="nama_kompetensi"
                  placeholder="Human Resource"
                  onChangeSetter={(input) => {
                    formik.setFieldValue("nama_kompetensi", input);
                  }}
                  inputValue={formik.values.nama_kompetensi}
                />
                <FormErrorMessage>
                  {formik.errors.nama_kompetensi as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                mb={4}
                isInvalid={formik.errors.jenis_kompetensi ? true : false}
              >
                <FormLabel>
                  Jenis Kompetensi
                  <RequiredForm />
                </FormLabel>
                <SelectJenisKompetensi
                  name="jenis_kompetensi"
                  onConfirm={(input) => {
                    formik.setFieldValue("jenis_kompetensi", input);
                  }}
                  inputValue={formik.values.jenis_kompetensi}
                />

                <FormErrorMessage>
                  {formik.errors.jenis_kompetensi as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl
                mb={4}
                isInvalid={formik.errors.total_tunjangan ? true : false}
              >
                <FormLabel>
                  Tunjangan
                  <RequiredForm />
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pl={4}>
                    <Text>Rp</Text>
                  </InputLeftElement>
                  <NumberInput
                    pl={12}
                    name="total_tunjangan"
                    placeholder="500.000"
                    onChangeSetter={(input) => {
                      formik.setFieldValue("total_tunjangan", input);
                    }}
                    inputValue={formik.values.total_tunjangan}
                  />
                </InputGroup>
                <FormErrorMessage>
                  {formik.errors.total_tunjangan as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.nilai_bor ? true : false}>
                <FormLabel>
                  Nilai BOR
                  <RequiredForm />
                </FormLabel>
                <InputGroup>
                  <InputLeftElement pl={4}>
                    <Text>Rp</Text>
                  </InputLeftElement>
                  <NumberInput
                    pl={12}
                    name="nilai_bor"
                    placeholder="500.000"
                    onChangeSetter={(input) => {
                      formik.setFieldValue("nilai_bor", input);
                    }}
                    inputValue={formik.values.nilai_bor}
                  />
                </InputGroup>
                <FormErrorMessage>
                  {formik.errors.nilai_bor as string}
                </FormErrorMessage>
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              form="editUnitKerjaForm"
              className="btn-ap clicky"
              colorScheme="ap"
              w={"100%"}
              isLoading={loading}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}