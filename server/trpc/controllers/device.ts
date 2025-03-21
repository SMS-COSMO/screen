import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewDevice } from '../../db/db';
import { db } from '../../db/db';
import { devices } from '../../db/schema';

export class DeviceController {
  async create(newDevice: TNewDevice) {
    await db.insert(devices).values(newDevice);
    return '设备创建成功';
  }

  async delete(id: number) {
    await db.delete(devices).where(eq(devices.id, id));
    return '设备删除成功';
  }

  async edit(id: number, new_location: string) {
    await db.update(devices)
      .set({ location: new_location })
      .where(eq(devices.id, id));
    return '设备名修改成功';
  }

  async bindProgram(id: number, programId: number) {
    await db.update(devices)
      .set({ programId })
      .where(eq(devices.id, id));
    return '节目绑定成功';
  }

  async getInfo(id: number) {
    const device = await db.query.devices.findFirst({
      where: eq(devices.id, id),
      with: {
        program: true,
      },
    });
    if (!device)
      throw new TRPCError({ code: 'NOT_FOUND', message: '设备不存在' });
    return device;
  }

  async getList() {
    const res = await db.query.devices.findMany();
    return res;
  }
}
