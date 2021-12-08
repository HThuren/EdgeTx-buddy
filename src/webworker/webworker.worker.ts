// EXECUTES IN A WEB WORKER
/* eslint-disable no-restricted-globals */
import {
  createBusLinkBackend,
  createSchemaExecutor,
  webWorkerBus,
} from "apollo-bus-link";
import { createContext, schema } from "shared/backend";
import crossBoundary from "./crossBoundary";

const fileSystem = {
  requestWritableFolder: crossBoundary.showDirectoryPicker.call,
};

const usb = {
  requestDevice: async () => {
    const pickedDevice = await crossBoundary.requestDevice.call({
      filters: [],
    });
    const devicesWithPermission = await navigator.usb.getDevices();
    const device = devicesWithPermission.find(
      ({ vendorId, productId }) =>
        vendorId === pickedDevice.vendorId &&
        productId === pickedDevice.productId
    );

    if (!device) {
      throw new Error("Couldn't retrieve device on webworker side");
    }

    return device;
  },
  deviceList: () => navigator.usb.getDevices(),
};

const backend = createBusLinkBackend({
  registerBus: webWorkerBus(self),
  executor: createSchemaExecutor({
    schema,
    context: createContext({
      fileSystem,
      usb,
    }),
  }),
});

backend.listen();