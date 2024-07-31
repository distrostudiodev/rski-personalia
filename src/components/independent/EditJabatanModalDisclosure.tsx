import {
  Box,
  BoxProps,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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
import { ReactNode, useRef, useState } from "react";
import * as yup from "yup";
import req from "../../constant/req";
import useRenderTrigger from "../../global/useRenderTrigger";
import useBackOnClose from "../../hooks/useBackOnClose";
import backOnClose from "../../lib/backOnClose";
import DisclosureHeader from "../dependent/DisclosureHeader";
import NumberInput from "../dependent/input/NumberInput";
import RequiredForm from "../form/RequiredForm";

interface Props extends BoxProps {
  rowData: any;
  children?: ReactNode;
}

export default function EditJabatanModalDisclosure({
  rowData,
  children,
  ...props
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useBackOnClose("tambah-jabatan-modal", isOpen, onOpen, onClose);
  const initialRef = useRef(null);

  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { rt, setRt } = useRenderTrigger();

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      nama_jabatan: rowData.columnsFormat[0].value,
      tunjangan: rowData.columnsFormat[2].value,
    },
    validationSchema: yup.object().shape({
      nama_jabatan: yup.string().required("Harus diisi"),
      tunjangan: yup.number().required("Harus diisi"),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = {
        nama_jabatan: values.nama_jabatan,
        tunjangan: values.tunjangan,
      };
      setLoading(true);
      req
        .post("/api/rski/dashboard/pengaturan/jabatan", payload)
        .then((r) => {
          if (r.status === 200) {
            toast({
              status: "success",
              title: r.data.message,
              isClosable: true,
            });
            setRt(!rt);
            resetForm();
          }
        })
        .catch((e) => {
          console.log(e);
          toast({
            status: "error",
            title: "Maaf terjadi kesalahan pada sistem",
            isClosable: true,
          });
          setRt(!rt);
        })
        .finally(() => {
          setLoading(false);
        });
    },
  });

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
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader ref={initialRef}>
            <DisclosureHeader
              title="Edit Jabatan"
              onClose={() => {
                formik.resetForm();
              }}
            />
          </ModalHeader>
          <ModalBody>
            <form id="editJabatanForm" onSubmit={formik.handleSubmit}>
              <FormControl
                mb={4}
                isInvalid={formik.errors.nama_jabatan ? true : false}
              >
                <FormLabel>
                  Nama Jabatan
                  <RequiredForm />
                </FormLabel>
                <Input
                  name="nama_jabatan"
                  placeholder="Human Resource"
                  onChange={formik.handleChange}
                  value={formik.values.nama_jabatan || ""}
                />
                <FormErrorMessage>
                  {formik.errors.nama_jabatan as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.tunjangan ? true : false}>
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
                    name="tunjangan"
                    placeholder="500.000"
                    onChangeSetter={(input) => {
                      formik.setFieldValue("tunjangan", input);
                    }}
                    inputValue={formik.values.tunjangan}
                  />
                </InputGroup>
                <FormErrorMessage>
                  {formik.errors.tunjangan as string}
                </FormErrorMessage>
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              form="editJabatanForm"
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
