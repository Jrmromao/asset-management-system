"use client";
import HeaderBox from "@/components/HeaderBox";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { kitSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useKitStore } from "@/lib/stores/kitStore";
import { useAssetStore } from "@/lib/stores/assetStore";
import { useLicenseStore } from "@/lib/stores/licenseStore";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import { KiltItemColumns } from "@/components/tables/KitItemColumns";

const Create = () => {
  const [isLoading, setIsLoading] = useState();

  // const [
  //   allKits,
  //   isAssetOpen,
  //   onAssetClose,
  //   onAssetOpen,
  //   isLicenseOpen,
  //   onLicenseOpen,
  //   onLicenseClose,
  //   isAccessoryOpen,
  //   onAccessoryClose,
  //   onAccessoryOpen,
  // ] = useKitStore((state) => [
  //   state.kits,
  //   state.isAssetOpen,
  //   state.onAssetClose,
  //   state.onAssetOpen,
  //   state.isLicenseOpen,
  //   state.onLicenseOpen,
  //   state.onLicenseClose,
  //   state.isAccessoryOpen,
  //   state.onAccessoryClose,
  //   state.onAccessoryOpen,
  // ]);
  const [allAssets] = useAssetStore((state) => [state.assets]);
  const [allLicenses] = useLicenseStore((state) => [state.licenses]);
  const [allAccessories] = useAccessoryStore((state) => [state.accessories]);

  const [assetsList, setAssetsList] = useState<Asset[]>([]);
  const [licensesList, setLicensesList] = useState([]);
  const [accessoriesList, setAccessoriesList] = useState([]);

  const form = useForm<z.infer<typeof kitSchema>>({
    resolver: zodResolver(kitSchema),
    defaultValues: {
      name: "",
      assetId: "",
      accessoryId: "",
      licenseId: "",
    },
  });

  const assetId = form.watch("assetId");
  const licenseId = form.watch("licenseId");
  const accessoryId = form.watch("accessoryId");

  useEffect(() => {
    // assetIdRef.current = assetId;
    // licenseIdRef.current = licenseId;
    // accessoryIdRef.current = accessoryId;

    console.log(assetId);
    console.log(licenseId);
    console.log(accessoryId);
    const newAsset = allAssets.find((asset) => asset.id === assetId);
    if (newAsset) {
      setAssetsList((prevAssetsList) => [...prevAssetsList, newAsset]);
    }
  }, [assetId, licenseId, accessoryId]);

  const columns = useMemo(() => KiltItemColumns(), []);

  const onSubmit = async (data: z.infer<typeof kitSchema>) => {
    try {
      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
    }
  };

  return (
    <div className="assets">
      <div>
        <HeaderBox
          title="Create Pre-defined Kit"
          subtitle="Create a new kit using the form below"
        />
      </div>
      {/*<section className="w-full bg-white z-50 max-h-[900px] overflow-y-auto p-4">*/}
      {/*  <Form {...form}>*/}
      {/*    <form onSubmit={form.handleSubmit(onSubmit)}>*/}
      {/*      <Card className={"p-3.5 mb-5"}>*/}
      {/*        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
      {/*          <div className="bg-white p-4">*/}
      {/*            <div className="flex flex-col gap-4 pt-5">*/}
      {/*              <div className="flex-1">*/}
      {/*                <CustomInput*/}
      {/*                  control={form.control}*/}
      {/*                  {...form.register("name")}*/}
      {/*                  label="Kit Title"*/}
      {/*                  placeholder="e.g. IT Onboarding Kit"*/}
      {/*                  type="text"*/}
      {/*                />*/}
      {/*              </div>*/}
      {/*            </div>*/}
      {/*          </div>*/}

      {/*          <div className="bg-white p-4 md:mt-11 ">*/}
      {/*            <Alert>*/}
      {/*              <InfoIcon className="h-4 w-4" />*/}
      {/*              <AlertTitle>Note</AlertTitle>*/}
      {/*              <AlertDescription>*/}
      {/*                Add something meaningful.*/}
      {/*              </AlertDescription>*/}
      {/*            </Alert>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </Card>*/}

      {/*      <hr />*/}
      {/*      <Tabs defaultValue="assets">*/}
      {/*        <div className="flex items-center">*/}
      {/*          <TabsList>*/}
      {/*            <TabsTrigger value="assets">Assets</TabsTrigger>*/}
      {/*            <TabsTrigger value="accessories">Accessories</TabsTrigger>*/}
      {/*            <TabsTrigger value="licenses">Licenses</TabsTrigger>*/}
      {/*          </TabsList>*/}
      {/*          <div className="ml-auto flex items-center gap-2"></div>*/}
      {/*        </div>*/}
      {/*        <div className={"w-full bg-white p-4 h-full overflow-auto"}>*/}
      {/*          <TabsContent value="assets">*/}
      {/*            <div className="flex flex-row justify-between items-center gap-4 mb-3">*/}
      {/*              <h2 className="header-2">Assets</h2>*/}
      {/*              <Button type="button" variant="link" onClick={onAssetOpen}>*/}
      {/*                Add Asset*/}
      {/*              </Button>*/}
      {/*            </div>*/}
      {/*            <DataTable columns={columns} data={assetsList} />*/}
      {/*            <div className="w-full md:w-full lg:w-1/3">*/}
      {/*              <DialogContainer*/}
      {/*                open={isAssetOpen}*/}
      {/*                onOpenChange={onAssetClose}*/}
      {/*                title={"Select an Asset"}*/}
      {/*                description={""}*/}
      {/*                form={*/}
      {/*                  <KitItemForm*/}
      {/*                    label={"Add Asset"}*/}
      {/*                    onClose={onAssetClose}*/}
      {/*                    data={allAssets}*/}
      {/*                    // control={form.control}*/}
      {/*                    name={"assetId"}*/}
      {/*                    placeholder={"eg. Laptop"}*/}
      {/*                    value={form.watch("assetId")}*/}
      {/*                  />*/}
      {/*                }*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*          </TabsContent>*/}

      {/*          <TabsContent value="accessories">*/}
      {/*            <div className="flex flex-row justify-between items-center gap-4 mb-3">*/}
      {/*              <h2 className="header-2">Accessories</h2>*/}
      {/*              <Button*/}
      {/*                type="button"*/}
      {/*                variant="link"*/}
      {/*                onClick={onAccessoryOpen}*/}
      {/*              >*/}
      {/*                Add Accessory*/}
      {/*              </Button>*/}
      {/*            </div>*/}
      {/*            <div className="w-full md:w-full lg:w-1/3">*/}
      {/*              <DialogContainer*/}
      {/*                open={isAccessoryOpen}*/}
      {/*                onOpenChange={onAccessoryClose}*/}
      {/*                title={"Select an Asset"}*/}
      {/*                description={""}*/}
      {/*                form={*/}
      {/*                  <KitItemForm*/}
      {/*                    label={"Add Asset"}*/}
      {/*                    onClose={onAssetClose}*/}
      {/*                    data={allAssets}*/}
      {/*                    // control={form.control}*/}
      {/*                    name={"accessoryId"}*/}
      {/*                    placeholder={"eg. Keyboard"}*/}
      {/*                    value={form.watch("accessoryId")}*/}
      {/*                  />*/}
      {/*                }*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*            <DataTable columns={columns} data={accessoriesList} />*/}
      {/*          </TabsContent>*/}
      {/*          <TabsContent value="licenses">*/}
      {/*            <div className="flex flex-row justify-between items-center gap-4 mb-3">*/}
      {/*              <h2 className="header-2">Licenses</h2>*/}
      {/*              <Button*/}
      {/*                type="button"*/}
      {/*                variant="link"*/}
      {/*                onClick={onLicenseOpen}*/}
      {/*              >*/}
      {/*                Add License*/}
      {/*              </Button>*/}
      {/*            </div>*/}

      {/*            <div className="w-full md:w-full lg:w-1/3">*/}
      {/*              <DialogContainer*/}
      {/*                open={isLicenseOpen}*/}
      {/*                onOpenChange={onLicenseClose}*/}
      {/*                title={"Select an Asset"}*/}
      {/*                description={""}*/}
      {/*                form={*/}
      {/*                  <KitItemForm*/}
      {/*                    label={"Add License"}*/}
      {/*                    onClose={onLicenseClose}*/}
      {/*                    data={allAssets}*/}
      {/*                    // control={form.control}*/}
      {/*                    name={"licenseId"}*/}
      {/*                    placeholder={"eg. Office 365"}*/}
      {/*                    value={form.watch("licenseId")}*/}
      {/*                  />*/}
      {/*                }*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*            <DataTable columns={columns} data={licensesList} />*/}
      {/*          </TabsContent>*/}
      {/*        </div>*/}
      {/*      </Tabs>*/}
      {/*      <Button*/}
      {/*        type="submit"*/}
      {/*        className={"form-btn mt-6 w-full  md:w-auto"}*/}
      {/*        disabled={isLoading}*/}
      {/*      >*/}
      {/*        {isLoading ? (*/}
      {/*          <>*/}
      {/*            <Loader2 size={20} className={"animate-spin"} />*/}
      {/*            &nbsp; Loading...*/}
      {/*          </>*/}
      {/*        ) : (*/}
      {/*          "Submit Kit"*/}
      {/*        )}*/}
      {/*      </Button>*/}
      {/*    </form>*/}
      {/*  </Form>*/}
      {/*</section>*/}
    </div>
  );
};
export default Create;
