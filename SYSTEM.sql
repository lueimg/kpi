/*
 Navicat Premium Data Transfer

 Source Server         : docker.kpi.oracle
 Source Server Type    : Oracle
 Source Server Version : 112020
 Source Host           : 0.0.0.0
 Source Schema         : SYSTEM

 Target Server Type    : Oracle
 Target Server Version : 112020
 File Encoding         : utf-8

 Date: 01/25/2017 20:56:58 PM
*/

-- ----------------------------
--  Table structure for KPI_COMMENTS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_COMMENTS";
CREATE TABLE "KPI_COMMENTS" (   "ID" NUMBER(11,0) NOT NULL, "USUARIO" VARCHAR2(100BYTE), "COMENTARIO" VARCHAR2(500BYTE), "CREATED_AT" DATE DEFAULT SYSDATE  NOT NULL, "STATUS" NUMBER(1,0) DEFAULT 1   NOT NULL, "KEYID" NUMBER(11,0) NOT NULL);

-- ----------------------------
--  Table structure for KPI_CONTENTS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_CONTENTS";
CREATE TABLE "KPI_CONTENTS" (   "ID" NUMBER(11,0) NOT NULL, "NAME" VARCHAR2(500BYTE) NOT NULL, "REPORT_ID" NUMBER(11,0) NOT NULL, "SUBREPORT_ID" NUMBER(11,0), "CREATED_AT" DATE DEFAULT SYSDATE , "STATUS" NUMBER(1,0) DEFAULT 1 , "PROCEDURE" VARCHAR2(100BYTE), "WEEKSRANGE" NUMBER(2,0));

-- ----------------------------
--  Table structure for KPI_CONTENTS_FIELDS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_CONTENTS_FIELDS";
CREATE TABLE "KPI_CONTENTS_FIELDS" (   "ID" NUMBER(11,0) NOT NULL, "NAME" VARCHAR2(500BYTE) NOT NULL, "STATUS" NUMBER(1,0) DEFAULT 1  NOT NULL, "CREATED_AT" DATE DEFAULT SYSDATE , "CONTENT_ID" NUMBER(11,0) NOT NULL);

-- ----------------------------
--  Table structure for KPI_GRAPHICS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_GRAPHICS";
CREATE TABLE "KPI_GRAPHICS" (   "ID" NUMBER(11,0) NOT NULL, "CONTENT_ID" NUMBER(11,0) NOT NULL, "STATUS" NUMBER(1,0) DEFAULT 1  NOT NULL, "CREATED_AT" DATE DEFAULT SYSDATE    NOT NULL, "TYPE" VARCHAR2(50BYTE), "TITLE" VARCHAR2(500BYTE));

-- ----------------------------
--  Table structure for KPI_REPORTS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_REPORTS";
CREATE TABLE "KPI_REPORTS" (   "ID" NUMBER(11,0) NOT NULL, "NAME" VARCHAR2(500BYTE) NOT NULL, "STATUS" NUMBER(1,0) DEFAULT 1  , "CREATED_AT" DATE DEFAULT SYSDATE );

-- ----------------------------
--  Table structure for KPI_RESUMEN
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_RESUMEN";
CREATE TABLE "KPI_RESUMEN" (   "ID" NUMBER(11,0), "SEMANA" NUMBER(2,0), "ANIO" NUMBER(4,0), "UGW_NAME" VARCHAR2(50BYTE), "KPI" VARCHAR2(50BYTE), "VALOR" NUMBER(38,15));

-- ----------------------------
--  Table structure for KPI_SERIES
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_SERIES";
CREATE TABLE "KPI_SERIES" (   "ID" NUMBER(11,0) NOT NULL, "GRAPHIC_ID" NUMBER(11,0), "SUBGRAPHIC_TYPE" VARCHAR2(100BYTE), "SERIE_NAME" VARCHAR2(50BYTE), "NAME_FROM_PROCEDURE" VARCHAR2(50BYTE), "STATUS" NUMBER(1,0) DEFAULT 1, "CREATED_AT" DATE DEFAULT SYSDATE, "YAXIS" NUMBER DEFAULT 0 );

-- ----------------------------
--  Table structure for KPI_SUBREPORTS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_SUBREPORTS";
CREATE TABLE "KPI_SUBREPORTS" (   "ID" NUMBER(11,0) NOT NULL, "NAME" VARCHAR2(500BYTE) NOT NULL, "REPORT_ID" NUMBER(11,0) NOT NULL, "STATUS" NUMBER(1,0) DEFAULT 1 , "CREATED_AT" DATE DEFAULT SYSDATE );

-- ----------------------------
--  Table structure for KPI_TEST
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_TEST";
CREATE TABLE "KPI_TEST" (   "ID" RAW(16) DEFAULT sys_guid()   NOT NULL, "NAME" VARCHAR2(400BYTE));

-- ----------------------------
--  Table structure for KPI_TMP_REP_GRAFICO
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_TMP_REP_GRAFICO";
CREATE TABLE "KPI_TMP_REP_GRAFICO" (   "ORDEN" NUMBER, "REFFECHA" VARCHAR2(50BYTE), "ELEMENTO" VARCHAR2(100BYTE), "VALOR1" NUMBER, "VALOR2" NUMBER, "VALOR3" NUMBER, "VALOR4" NUMBER, "VALOR5" NUMBER, "VALOR6" NUMBER);

-- ----------------------------
--  Table structure for KPI_YAXIS
-- ----------------------------
DROP TABLE "SYSTEM"."KPI_YAXIS";
CREATE TABLE "KPI_YAXIS" (   "ID" NUMBER(11,0) NOT NULL, "TITLE" VARCHAR2(50BYTE), "SUFFIX" VARCHAR2(50BYTE), "OPPOSITE" NUMBER, "STATUS" NUMBER DEFAULT 1, "CREATED_AT" DATE DEFAULT SYSDATE, "GRAPHIC_ID" NUMBER(11,0), "ORDEN" NUMBER(2,0));

-- ----------------------------
--  Primary key structure for table KPI_COMMENTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_COMMENTS" ADD CONSTRAINT "SYS_C007207" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_COMMENTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_COMMENTS" ADD CONSTRAINT "SYS_C007206" CHECK ("ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007233" CHECK ("CREATED_AT" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007234" CHECK ("STATUS" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007235" CHECK ("KEYID" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_CONTENTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_CONTENTS" ADD CONSTRAINT "SYS_C007185" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_CONTENTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_CONTENTS" ADD CONSTRAINT "SYS_C007184" CHECK ("ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007186" CHECK ("NAME" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007187" CHECK ("REPORT_ID" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_CONTENTS_FIELDS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_CONTENTS_FIELDS" ADD CONSTRAINT "SYS_C007193" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_CONTENTS_FIELDS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_CONTENTS_FIELDS" ADD CONSTRAINT "SYS_C007190" CHECK ("ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007191" CHECK ("NAME" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007192" CHECK ("STATUS" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007194" CHECK ("CONTENT_ID" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_GRAPHICS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_GRAPHICS" ADD CONSTRAINT "SYS_C007197" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_GRAPHICS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_GRAPHICS" ADD CONSTRAINT "SYS_C007195" CHECK ("ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007196" CHECK ("STATUS" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007199" CHECK ("CONTENT_ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007201" CHECK ("CREATED_AT" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_REPORTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_REPORTS" ADD CONSTRAINT "SYS_C007182" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_REPORTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_REPORTS" ADD CONSTRAINT "SYS_C007075" CHECK ("ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007076" CHECK ("NAME" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_SERIES
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_SERIES" ADD CONSTRAINT "SYS_C007203" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_SERIES
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_SERIES" ADD CONSTRAINT "SYS_C007202" CHECK ("ID" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_SUBREPORTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_SUBREPORTS" ADD CONSTRAINT "SYS_C007183" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_SUBREPORTS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_SUBREPORTS" ADD CONSTRAINT "SYS_C007176" CHECK ("ID" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007177" CHECK ("NAME" IS NOT NULL) ENABLE ADD CONSTRAINT "SYS_C007178" CHECK ("REPORT_ID" IS NOT NULL) ENABLE;

-- ----------------------------
--  Primary key structure for table KPI_TEST
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_TEST" ADD CONSTRAINT "SYS_C007175" PRIMARY KEY("ID");

-- ----------------------------
--  Primary key structure for table KPI_YAXIS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_YAXIS" ADD CONSTRAINT "SYS_C007253" PRIMARY KEY("ID");

-- ----------------------------
--  Checks structure for table KPI_YAXIS
-- ----------------------------
ALTER TABLE "SYSTEM"."KPI_YAXIS" ADD CONSTRAINT "SYS_C007252" CHECK ("ID" IS NOT NULL) ENABLE;

