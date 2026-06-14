package org.cloud.dto;

import lombok.Data;

@Data
public class Irdnt_Info {
	private String recipeId;
	private int irdntSn;
	private String irdntNm;
	private String irdntCpcty;
	private String irdntTyCode;
	private String irdntTyNm;

	public String getRecipeId() {
		return recipeId;
	}

	public void setRecipeId(String recipeId) {
		this.recipeId = recipeId;
	}

	public int getIrdntSn() {
		return irdntSn;
	}

	public void setIrdntSn(int irdntSn) {
		this.irdntSn = irdntSn;
	}

	public String getIrdntNm() {
		return irdntNm;
	}

	public void setIrdntNm(String irdntNm) {
		this.irdntNm = irdntNm;
	}

	public String getIrdntCpcty() {
		return irdntCpcty;
	}

	public void setIrdntCpcty(String irdntCpcty) {
		this.irdntCpcty = irdntCpcty;
	}

	public String getIrdntTyCode() {
		return irdntTyCode;
	}

	public void setIrdntTyCode(String irdntTyCode) {
		this.irdntTyCode = irdntTyCode;
	}

	public String getIrdntTyNm() {
		return irdntTyNm;
	}

	public void setIrdntTyNm(String irdntTyNm) {
		this.irdntTyNm = irdntTyNm;
	}

}
