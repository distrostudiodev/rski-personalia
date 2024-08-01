import {
  Box,
  BoxProps,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import SelectJabatan from "../dependent/_Select/SelectJabatan";
import DisclosureHeader from "../dependent/DisclosureHeader";
import Textarea from "../dependent/input/Textarea";
import RequiredForm from "../form/RequiredForm";

interface Props extends BoxProps {
  rowData: any;
  children?: ReactNode;
}

export default function EditKuisionerModalDisclosure({
  rowData,
  children,
  ...props
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useBackOnClose(`edit-kuisioner-modal-${rowData.id}`, isOpen, onOpen, onClose);
  const initialRef = useRef(null);

  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const { rt, setRt } = useRenderTrigger();

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      pertanyaan: rowData.columnsFormat[0].value,
      jabatan: {
        value: rowData.columnsFormat[2].original_value?.id,
        label: rowData.columnsFormat[2].original_value?.nama_jabatan,
      },
    },
    validationSchema: yup.object().shape({
      pertanyaan: yup.string().required("Harus diisi"),
      jabatan: yup.object().required("Harus diisi"),
    }),
    onSubmit: (values, { resetForm }) => {
      const payload = {
        pertanyaan: values.pertanyaan,
        jabatan_id: values.jabatan.value,
        _method: "patch",
      };
      console.log(payload);
      setLoading(true);
      req
        .post(
          `/api/rski/dashboard/pengaturan/unit-kerja/${rowData.id}`,
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
      "pertanyaan",
      rowData.columnsFormat[0].value
    );
    formikRef.current.setFieldValue("jabatan", {
      value: rowData.columnsFormat[2].original_value?.id,
      label: rowData.columnsFormat[2].original_value?.nama_jabatan,
    });
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
              title="Edit Kuisioner"
              onClose={() => {
                formik.resetForm();
              }}
            />
          </ModalHeader>
          <ModalBody>
            <form id="editKuisionerForm" onSubmit={formik.handleSubmit}>
              <FormControl
                mb={4}
                isInvalid={formik.errors.pertanyaan ? true : false}
              >
                <FormLabel>
                  Pertanyaan
                  <RequiredForm />
                </FormLabel>
                <Textarea
                  name="pertanyaan"
                  placeholder="Pertanyaan untuk jabaatan yang dipilih"
                  onChangeSetter={(input) => {
                    formik.setFieldValue("pertanyaan", input);
                  }}
                  inputValue={formik.values.pertanyaan}
                />
                <FormErrorMessage>
                  {formik.errors.pertanyaan as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.jabatan ? true : false}>
                <FormLabel>
                  Jabatan
                  <RequiredForm />
                </FormLabel>
                <SelectJabatan
                  name="jabatan"
                  onConfirm={(input) => {
                    formik.setFieldValue("jabatan", input);
                  }}
                  inputValue={formik.values.jabatan}
                />

                <FormErrorMessage>
                  {formik.errors.jabatan as string}
                </FormErrorMessage>
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              form="editKuisionerForm"
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