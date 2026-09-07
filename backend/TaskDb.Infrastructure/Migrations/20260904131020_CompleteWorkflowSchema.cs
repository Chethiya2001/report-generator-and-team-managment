using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskDb.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CompleteWorkflowSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsBillable",
                table: "tasks");

            migrationBuilder.RenameColumn(
                name: "ReleaseNotes",
                table: "report_versions",
                newName: "OptionalNotes");

            migrationBuilder.RenameColumn(
                name: "IsHrIssue",
                table: "blockers",
                newName: "IsKeyIssue");

            migrationBuilder.RenameColumn(
                name: "HrAcknowledgement",
                table: "achievements",
                newName: "IsKeyAchievement");

            migrationBuilder.AddColumn<string>(
                name: "Deliverable",
                table: "tasks",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "ReportVersionId",
                table: "report_actions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Severity",
                table: "blockers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql("UPDATE report_actions ra JOIN reports r ON r.Id = ra.ReportId JOIN report_versions rv ON rv.ReportId = r.Id AND rv.VersionNumber = r.CurrentVersion SET ra.ReportVersionId = rv.Id");

            migrationBuilder.CreateIndex(
                name: "IX_report_actions_ReportVersionId",
                table: "report_actions",
                column: "ReportVersionId");

            migrationBuilder.AddForeignKey(
                name: "FK_report_actions_report_versions_ReportVersionId",
                table: "report_actions",
                column: "ReportVersionId",
                principalTable: "report_versions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_report_actions_report_versions_ReportVersionId",
                table: "report_actions");

            migrationBuilder.DropIndex(
                name: "IX_report_actions_ReportVersionId",
                table: "report_actions");

            migrationBuilder.DropColumn(
                name: "Deliverable",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "ReportVersionId",
                table: "report_actions");

            migrationBuilder.DropColumn(
                name: "Severity",
                table: "blockers");

            migrationBuilder.RenameColumn(
                name: "OptionalNotes",
                table: "report_versions",
                newName: "ReleaseNotes");

            migrationBuilder.RenameColumn(
                name: "IsKeyIssue",
                table: "blockers",
                newName: "IsHrIssue");

            migrationBuilder.RenameColumn(
                name: "IsKeyAchievement",
                table: "achievements",
                newName: "HrAcknowledgement");

            migrationBuilder.AddColumn<bool>(
                name: "IsBillable",
                table: "tasks",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}

