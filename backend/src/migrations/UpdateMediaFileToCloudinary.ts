import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMediaFileToCloudinary1641234567890
  implements MigrationInterface
{
  name = 'UpdateMediaFileToCloudinary1641234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new Cloudinary columns
    await queryRunner.query(`
            ALTER TABLE "media_files" 
            ADD COLUMN "publicId" VARCHAR(500),
            ADD COLUMN "url" VARCHAR(500),
            ADD COLUMN "secureUrl" VARCHAR(500),
            ADD COLUMN "width" INTEGER,
            ADD COLUMN "height" INTEGER,
            ADD COLUMN "duration" REAL
        `);

    // If you have existing data, you might want to populate the new columns
    // For now, we'll just set existing s3Key values to publicId for migration
    await queryRunner.query(`
            UPDATE "media_files" 
            SET "publicId" = "s3Key", 
                "url" = "s3Url",
                "secureUrl" = "s3Url"
            WHERE "s3Key" IS NOT NULL AND "s3Url" IS NOT NULL
        `);

    // Drop old S3 columns after migration
    await queryRunner.query(`
            ALTER TABLE "media_files" 
            DROP COLUMN "s3Key",
            DROP COLUMN "s3Url"
        `);

    // Make new columns NOT NULL after setting values
    await queryRunner.query(`
            ALTER TABLE "media_files" 
            ALTER COLUMN "publicId" SET NOT NULL,
            ALTER COLUMN "url" SET NOT NULL,
            ALTER COLUMN "secureUrl" SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back S3 columns
    await queryRunner.query(`
            ALTER TABLE "media_files" 
            ADD COLUMN "s3Key" VARCHAR(500) NOT NULL DEFAULT '',
            ADD COLUMN "s3Url" VARCHAR(500) NOT NULL DEFAULT ''
        `);

    // Migrate data back (if possible)
    await queryRunner.query(`
            UPDATE "media_files" 
            SET "s3Key" = "publicId", 
                "s3Url" = "secureUrl"
            WHERE "publicId" IS NOT NULL AND "secureUrl" IS NOT NULL
        `);

    // Drop Cloudinary columns
    await queryRunner.query(`
            ALTER TABLE "media_files" 
            DROP COLUMN "publicId",
            DROP COLUMN "url",
            DROP COLUMN "secureUrl",
            DROP COLUMN "width",
            DROP COLUMN "height",
            DROP COLUMN "duration"
        `);

    // Remove default values from S3 columns
    await queryRunner.query(`
            ALTER TABLE "media_files" 
            ALTER COLUMN "s3Key" DROP DEFAULT,
            ALTER COLUMN "s3Url" DROP DEFAULT
        `);
  }
}
